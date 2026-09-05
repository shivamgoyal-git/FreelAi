import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDateRange } from "@/utils/analyticsHelper";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "month";
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");

    const { startDate, endDate } = getDateRange(range, start, end);

    const proposals = await prisma.proposal.findMany({
      where: {
        userId,
        createdAt: { gte: startDate, lte: endDate },
      },
    });

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

    proposals.forEach((p) => {
      const s = p.status as keyof typeof statusMap;
      if (s in statusMap) {
        statusMap[s] += 1;
        valueMap[s] += p.value;
      }
    });

    const generated = statusMap.draft + statusMap.sent + statusMap.won + statusMap.lost;
    const sent = statusMap.sent + statusMap.won + statusMap.lost;
    const won = statusMap.won;
    const lost = statusMap.lost;

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
