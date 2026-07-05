import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import type { IProposalIntelligence } from "@/lib/proposal-intelligence";

/**
 * POST /api/proposals/predict
 *
 * Returns success prediction for a proposal.
 * Uses stored intelligence if available (no Gemini call needed —
 * probability is computed locally from scores already in intelligence).
 *
 * Body: { proposalId } OR { intelligence: IProposalIntelligence }
 * Returns: { probability, explanation, factors, metadata }
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const body = await req.json();
    const { proposalId, intelligence: inlineIntelligence } = body;

    let intelligence: IProposalIntelligence | null = null;

    if (inlineIntelligence) {
      intelligence = inlineIntelligence as IProposalIntelligence;
    } else if (proposalId) {
      const doc = await Proposal.findOne({ _id: proposalId, userId: session.user.id }).lean();
      if (!doc) {
        return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
      }
      intelligence = (doc.intelligence as IProposalIntelligence) ?? null;
    }

    if (!intelligence) {
      return NextResponse.json(
        {
          error:
            "No intelligence data found. Run /api/proposals/analyze first, or provide inline intelligence.",
        },
        { status: 400 }
      );
    }

    // Prediction is already in intelligence (computed locally during analysis)
    const { successPrediction, requestMetadata } = intelligence;

    return NextResponse.json({
      probability: successPrediction.probability,
      explanation: successPrediction.explanation,
      factors: successPrediction.factors,
      metadata: {
        ...requestMetadata,
        cacheHit: true, // prediction comes from stored intelligence
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Prediction failed";
    console.error("[/api/proposals/predict]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
