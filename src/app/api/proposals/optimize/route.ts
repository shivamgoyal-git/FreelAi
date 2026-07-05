import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ProposalIntelligenceEngine } from "@/lib/proposal-intelligence";
import { AiContextService } from "@/lib/ai-context-service";

/**
 * POST /api/proposals/optimize
 *
 * Optimizes the entire proposal for flow, clarity, and conversion.
 *
 * Body: { proposalText, jobPost, targetAreas?: string[] }
 * Returns: { optimized, diff, changes, metadata }
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { proposalText, jobPost, targetAreas = [] } = body;

    if (!proposalText?.trim() || !jobPost?.trim()) {
      return NextResponse.json(
        { error: "proposalText and jobPost are required" },
        { status: 400 }
      );
    }

    const freelancerContext = await AiContextService.getAiSystemContext(session.user.id);

    const result = await ProposalIntelligenceEngine.optimizeProposal(
      proposalText.trim(),
      jobPost.trim(),
      freelancerContext,
      targetAreas
    );

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Optimization failed";
    console.error("[/api/proposals/optimize]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
