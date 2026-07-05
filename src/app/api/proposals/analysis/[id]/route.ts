import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Proposal from "@/models/Proposal";

/**
 * GET /api/proposals/analysis/[id]
 *
 * Returns stored intelligence + intelligenceHistory for a proposal.
 * Always a cache-hit (data from DB, no Gemini call).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  try {
    const doc = await Proposal.findOne(
      { _id: id, userId: session.user.id },
      { intelligence: 1, intelligenceHistory: 1, clientName: 1, title: 1 }
    ).lean();

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
