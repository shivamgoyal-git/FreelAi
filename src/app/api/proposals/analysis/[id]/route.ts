import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const doc = await prisma.proposal.findFirst({
      where: { id, userId: session.user.id },
      select: {
        intelligence: true,
        intelligenceHistory: true,
        clientName: true,
        title: true,
      },
    });

    if (!doc) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    if (!doc.intelligence) {
      return NextResponse.json(
        {
          intelligence: null,
          intelligenceHistory: [],
          message: "No intelligence analysis found. Run /api/proposals/analyze first.",
        }
      );
    }

    return NextResponse.json({
      intelligence: doc.intelligence,
      intelligenceHistory: doc.intelligenceHistory ?? [],
      cached: true,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch analysis";
    console.error("[/api/proposals/analysis/[id]]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
