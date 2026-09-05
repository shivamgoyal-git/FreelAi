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

    const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const groupByDay = daysDiff <= 45;

    const invoices = await prisma.invoice.findMany({
      where: {
        userId,
        status: { not: "cancelled" },
        issueDate: { gte: startDate, lte: endDate },
      },
    });

    const aggregates: Record<string, { revenue: number; billed: number; outstanding: number }> = {};

    invoices.forEach((inv) => {
      const d = new Date(inv.issueDate);
      let key: string;
      if (groupByDay) {
        key = d.toISOString().split("T")[0]; // YYYY-MM-DD
      } else {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        key = `${year}-${month}`; // YYYY-MM
      }

      if (!aggregates[key]) {
        aggregates[key] = { revenue: 0, billed: 0, outstanding: 0 };
      }

      aggregates[key].revenue += inv.amountPaid;
      aggregates[key].billed += inv.total;
      aggregates[key].outstanding += inv.remainingAmount;
    });

    const chartData: Array<{ label: string; revenue: number; billed: number; outstanding: number }> = [];
    const tempDate = new Date(startDate);

    if (groupByDay) {
      while (tempDate <= endDate) {
        const dateStr = tempDate.toISOString().split("T")[0];
        const match = aggregates[dateStr];
        const label = tempDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        chartData.push({
          label,
          revenue: match ? match.revenue : 0,
          billed: match ? match.billed : 0,
          outstanding: match ? match.outstanding : 0,
        });
        tempDate.setDate(tempDate.getDate() + 1);
      }
    } else {
      while (tempDate <= endDate) {
        const year = tempDate.getFullYear();
        const month = String(tempDate.getMonth() + 1).padStart(2, "0");
        const monthStr = `${year}-${month}`;
        const match = aggregates[monthStr];
        const label = tempDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        chartData.push({
          label,
          revenue: match ? match.revenue : 0,
          billed: match ? match.billed : 0,
          outstanding: match ? match.outstanding : 0,
        });
        tempDate.setMonth(tempDate.getMonth() + 1);
      }
    }

    return NextResponse.json({ chartData });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load revenue analytics";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
