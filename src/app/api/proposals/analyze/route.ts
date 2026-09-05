import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProposalIntelligenceEngine } from "@/lib/proposal-intelligence";
import { AiContextService } from "@/lib/ai-context-service";
import { ProposalLocalAnalyzer } from "@/lib/proposal-local-analyzer";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { proposalId, proposalText: rawText, jobPost: rawJobPost } = body;

    let proposalText = rawText?.trim() ?? "";
    let jobPost = rawJobPost?.trim() ?? "";
    let clientName: string | undefined;
    let proposalDoc: any = null;

    if (proposalId) {
      proposalDoc = await prisma.proposal.findFirst({
        where: { id: proposalId, userId: session.user.id },
      });
      if (!proposalDoc) {
        return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
      }

      if (!proposalText) {
        const versions = Array.isArray(proposalDoc.versions) ? (proposalDoc.versions as any[]) : [];
        const activeVer = versions[proposalDoc.activeVersionIndex || 0];
        if (activeVer?.sections) {
          const { executiveSummary, scopeOfWork, timelineAndMilestones, callToAction } = activeVer.sections;
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

    const cachedIntelligence = (proposalDoc?.intelligence as any) ?? null;

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

    const freelancerContext = await AiContextService.getAiSystemContext(session.user.id);

    const intelligence = await ProposalIntelligenceEngine.analyzeProposal({
      proposalText,
      jobPost,
      clientName,
      freelancerContext,
      cachedIntelligence,
    });

    if (proposalDoc) {
      const history = Array.isArray(proposalDoc.intelligenceHistory)
        ? (proposalDoc.intelligenceHistory as any[])
        : [];
      if (history.length >= 10) history.shift();
      history.push(intelligence);

      await prisma.proposal.update({
        where: { id: proposalDoc.id },
        data: {
          intelligence: intelligence as any,
          intelligenceHistory: history as any,
        },
      });
    }

    return NextResponse.json({ intelligence, cached: false });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Analysis failed";
    console.error("[/api/proposals/analyze]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
