import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
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

    const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const groupByDay = daysDiff <= 45;
    const formatStr = groupByDay ? "%Y-%m-%d" : "%Y-%m";

    // Run aggregation
    const results = await Invoice.aggregate([
      {
        $match: {
          userId,
          status: { $ne: "cancelled" },
          issueDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: formatStr, date: "$issueDate" } },
          revenue: { $sum: "$amountPaid" },
          billed: { $sum: "$total" },
          outstanding: { $sum: "$remainingAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Construct full time-series timeline to fill in zeros for missing intervals
    const chartData: Array<{ label: string; revenue: number; billed: number; outstanding: number }> = [];
    const tempDate = new Date(startDate);

    if (groupByDay) {
      // Loop daily
      while (tempDate <= endDate) {
        const dateStr = tempDate.toISOString().split("T")[0]; // YYYY-MM-DD
        const match = results.find((r) => r._id === dateStr);
        
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
      // Loop monthly
      while (tempDate <= endDate) {
        const year = tempDate.getFullYear();
        const month = String(tempDate.getMonth() + 1).padStart(2, "0");
        const monthStr = `${year}-${month}`; // YYYY-MM
        const match = results.find((r) => r._id === monthStr);
        
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
