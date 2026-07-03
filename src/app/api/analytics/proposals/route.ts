import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import { getDateRange } from "@/utils/analyticsHelper";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "month";
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");

    const { startDate, endDate } = getDateRange(range, start, end);

    const breakdown = await Proposal.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$value" },
        },
      },
    ]);

    // Parse counts
    const statusMap = {
      draft: 0,
      sent: 0,
      won: 0,
      lost: 0,
    };
    const valueMap = {
      draft: 0,
      sent: 0,
      won: 0,
      lost: 0,
    };

    breakdown.forEach((b) => {
      const status = b._id as keyof typeof statusMap;
      if (status in statusMap) {
        statusMap[status] = b.count;
        valueMap[status] = b.totalValue;
      }
    });

    const generated = statusMap.draft + statusMap.sent + statusMap.won + statusMap.lost;
    const sent = statusMap.sent + statusMap.won + statusMap.lost;
    const won = statusMap.won;
    const lost = statusMap.lost;

    // Conversion rates
    const winRate = sent > 0 ? (won / sent) * 100 : 0;
    const sendRate = generated > 0 ? (sent / generated) * 100 : 0;

    return NextResponse.json({
      breakdown: [
        { status: "draft", label: "Drafts", count: statusMap.draft, value: valueMap.draft },
        { status: "sent", label: "Sent", count: statusMap.sent, value: valueMap.sent },
        { status: "won", label: "Won", count: statusMap.won, value: valueMap.won },
        { status: "lost", label: "Lost", count: statusMap.lost, value: valueMap.lost },
      ],
      funnel: {
        generated,
        sent,
        won,
        lost,
        winRate,
        sendRate,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load proposals analytics";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
