import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import { ProposalIntelligenceEngine } from "@/lib/proposal-intelligence";
import { AiContextService } from "@/lib/ai-context-service";
import { ProposalLocalAnalyzer } from "@/lib/proposal-local-analyzer";

/**
 * POST /api/proposals/analyze
 *
 * Analyzes a proposal using the hybrid local + Gemini pipeline.
 * If proposalId is provided and content hash matches stored intelligence,
 * returns cached result immediately without calling Gemini.
 *
 * Body:
 *   { proposalId?: string, proposalText?: string, jobPost?: string }
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const body = await req.json();
    const { proposalId, proposalText: rawText, jobPost: rawJobPost } = body;

    let proposalText = rawText?.trim() ?? "";
    let jobPost = rawJobPost?.trim() ?? "";
    let clientName: string | undefined;
    let proposalDoc: Awaited<ReturnType<typeof Proposal.findOne>> | null = null;

    // If proposalId is given, load from DB
    if (proposalId) {
      proposalDoc = await Proposal.findOne({ _id: proposalId, userId: session.user.id });
      if (!proposalDoc) {
        return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
      }

      // Use the active version's text if no explicit text was provided
      if (!proposalText) {
        const activeVer = proposalDoc.versions[proposalDoc.activeVersionIndex];
        if (activeVer) {
          const { executiveSummary, scopeOfWork, timelineAndMilestones, callToAction } =
            activeVer.sections;
          proposalText = [executiveSummary, scopeOfWork, timelineAndMilestones, callToAction]
            .filter(Boolean)
            .join("\n\n");
        }
      }
      if (!jobPost) jobPost = proposalDoc.jobPost;
      clientName = proposalDoc.clientName;
    }

    if (!proposalText || !jobPost) {
      return NextResponse.json(
        { error: "proposalText and jobPost are required (or a valid proposalId)" },
        { status: 400 }
      );
    }

    // Load cached intelligence for cache-check
    const cachedIntelligence = proposalDoc?.intelligence ?? null;

    // Quick cache check before any expensive operations
    if (cachedIntelligence) {
      const hash = ProposalLocalAnalyzer.computeHash(proposalText, jobPost);
      if (cachedIntelligence.contentHash === hash) {
        return NextResponse.json({
          intelligence: {
            ...cachedIntelligence,
            requestMetadata: {
              ...cachedIntelligence.requestMetadata,
              cacheHit: true,
            },
          },
          cached: true,
        });
      }
    }

    // Fetch freelancer context for better AI analysis
    const freelancerContext = await AiContextService.getAiSystemContext(session.user.id);

    // Run full analysis pipeline
    const intelligence = await ProposalIntelligenceEngine.analyzeProposal({
      proposalText,
      jobPost,
      clientName,
      freelancerContext,
      cachedIntelligence,
    });

    // Persist to database if we have a proposal document
    if (proposalDoc) {
      // Cap history at 10 entries
      const history = Array.isArray(proposalDoc.intelligenceHistory)
        ? proposalDoc.intelligenceHistory
        : [];
      if (history.length >= 10) history.shift();
      history.push(intelligence);

      proposalDoc.intelligence = intelligence;
      proposalDoc.intelligenceHistory = history;
      await proposalDoc.save();
    }

    return NextResponse.json({ intelligence, cached: false });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Analysis failed";
    console.error("[/api/proposals/analyze]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
