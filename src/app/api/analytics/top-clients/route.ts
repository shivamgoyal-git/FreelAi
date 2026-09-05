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

    const invoices = await prisma.invoice.findMany({
      where: {
        userId,
        status: { not: "cancelled" },
        issueDate: { gte: startDate, lte: endDate },
      },
      include: { client: true },
    });

    const clientMap = new Map<string, { name: string; company: string; revenue: number; outstanding: number; billed: number }>();

    invoices.forEach((inv) => {
      const clientId = inv.clientId;
      const clientName = inv.client?.name || "Unknown Client";
      const clientCompany = inv.client?.company || "N/A";

      if (!clientMap.has(clientId)) {
        clientMap.set(clientId, {
          name: clientName,
          company: clientCompany,
          revenue: 0,
          outstanding: 0,
          billed: 0,
        });
      }

      const entry = clientMap.get(clientId)!;
      entry.revenue += inv.amountPaid;
      entry.outstanding += inv.remainingAmount;
      entry.billed += inv.total;
    });

    const topClients = Array.from(clientMap.values())
      .map((c) => ({
        ...c,
        revenue: Number(c.revenue.toFixed(2)),
        outstanding: Number(c.outstanding.toFixed(2)),
        billed: Number(c.billed.toFixed(2)),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return NextResponse.json({ topClients });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load top clients analytics";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
