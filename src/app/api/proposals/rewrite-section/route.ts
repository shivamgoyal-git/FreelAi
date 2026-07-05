import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ProposalIntelligenceEngine, ProposalSectionKey } from "@/lib/proposal-intelligence";
import { AiContextService } from "@/lib/ai-context-service";

const VALID_SECTIONS: ProposalSectionKey[] = [
  "executiveSummary",
  "scopeOfWork",
  "timelineAndMilestones",
  "callToAction",
  "pricingExplanation",
];

/**
 * POST /api/proposals/rewrite-section
 *
 * Rewrites a single named proposal section without touching the rest.
 *
 * Body: { section, sectionText, jobPost, reason?, tone? }
 * Returns: { rewritten, diff, changes, metadata }
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { section, sectionText, jobPost, reason } = body;

    if (!section || !VALID_SECTIONS.includes(section)) {
      return NextResponse.json(
        {
          error: `Invalid section. Must be one of: ${VALID_SECTIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!sectionText?.trim() || !jobPost?.trim()) {
      return NextResponse.json(
        { error: "sectionText and jobPost are required" },
        { status: 400 }
      );
    }

    const freelancerContext = await AiContextService.getAiSystemContext(session.user.id);

    const result = await ProposalIntelligenceEngine.rewriteSection(
      section as ProposalSectionKey,
      sectionText.trim(),
      jobPost.trim(),
      freelancerContext,
      reason
    );

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Section rewrite failed";
    console.error("[/api/proposals/rewrite-section]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
