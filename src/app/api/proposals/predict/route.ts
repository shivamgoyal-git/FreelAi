import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { IProposalIntelligence } from "@/lib/proposal-intelligence";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { proposalId, intelligence: inlineIntelligence } = body;

    let intelligence: IProposalIntelligence | null = null;

    if (inlineIntelligence) {
      intelligence = inlineIntelligence as IProposalIntelligence;
    } else if (proposalId) {
      const doc = await prisma.proposal.findFirst({
        where: { id: proposalId, userId: session.user.id },
      });
      if (!doc) {
        return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
      }
      intelligence = (doc.intelligence as unknown as IProposalIntelligence) ?? null;
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

    const { successPrediction, requestMetadata } = intelligence;

    return NextResponse.json({
      probability: successPrediction.probability,
      explanation: successPrediction.explanation,
      factors: successPrediction.factors,
      metadata: {
        ...requestMetadata,
        cacheHit: true,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Prediction failed";
    console.error("[/api/proposals/predict]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
