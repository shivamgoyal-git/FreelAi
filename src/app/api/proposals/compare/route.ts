import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProposalIntelligenceEngine, IProposalIntelligence } from "@/lib/proposal-intelligence";
import { AiContextService } from "@/lib/ai-context-service";
import { ProposalLocalAnalyzer } from "@/lib/proposal-local-analyzer";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { proposalIds } = await req.json();

    if (!Array.isArray(proposalIds) || proposalIds.length < 2 || proposalIds.length > 3) {
      return NextResponse.json(
        { error: "proposalIds must be an array of 2 to 3 proposal IDs" },
        { status: 400 }
      );
    }

    const freelancerContext = await AiContextService.getAiSystemContext(session.user.id);

    const docs = await prisma.proposal.findMany({
      where: {
        id: { in: proposalIds },
        userId: session.user.id,
      },
    });

    if (docs.length !== proposalIds.length) {
      return NextResponse.json(
        { error: "One or more proposals not found" },
        { status: 404 }
      );
    }

    const intelligences: Array<IProposalIntelligence & { id: string; label: string }> = [];

    for (const doc of docs) {
      const versions = Array.isArray(doc.versions) ? (doc.versions as any[]) : [];
      const activeVer = versions[doc.activeVersionIndex || 0];
      const sections = activeVer?.sections;
      const proposalText = sections
        ? [sections.executiveSummary, sections.scopeOfWork, sections.timelineAndMilestones, sections.callToAction]
            .filter(Boolean)
            .join("\n\n")
        : "";

      const jobPost = doc.jobPost;
      const cachedIntelligence = (doc.intelligence as unknown as IProposalIntelligence) ?? null;

      let intel: IProposalIntelligence;

      if (cachedIntelligence) {
        const hash = ProposalLocalAnalyzer.computeHash(proposalText, jobPost);
        if (cachedIntelligence.contentHash === hash) {
          intel = { ...cachedIntelligence, requestMetadata: { ...cachedIntelligence.requestMetadata, cacheHit: true } };
        } else {
          intel = await ProposalIntelligenceEngine.analyzeProposal({
            proposalText,
            jobPost,
            clientName: doc.clientName,
            freelancerContext,
            cachedIntelligence,
          });
        }
      } else {
        intel = await ProposalIntelligenceEngine.analyzeProposal({
          proposalText,
          jobPost,
          clientName: doc.clientName,
          freelancerContext,
          cachedIntelligence: null,
        });
      }

      intelligences.push({
        ...intel,
        id: doc.id,
        label: doc.clientName || doc.title,
      });
    }

    const matrix = ProposalIntelligenceEngine.compareProposals(intelligences);

    return NextResponse.json({ matrix, intelligences });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Comparison failed";
    console.error("[/api/proposals/compare]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
