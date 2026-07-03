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

    const topClients = await Invoice.aggregate([
      {
        $match: {
          userId,
          status: { $ne: "cancelled" },
          issueDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$clientId",
          revenue: { $sum: "$amountPaid" },
          outstanding: { $sum: "$remainingAmount" },
          billed: { $sum: "$total" },
        },
      },
      {
        $lookup: {
          from: "clients",
          localField: "_id",
          foreignField: "_id",
          as: "clientInfo",
        },
      },
      {
        $unwind: {
          path: "$clientInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: { $ifNull: ["$clientInfo.name", "Unknown Client"] },
          company: { $ifNull: ["$clientInfo.company", "N/A"] },
          revenue: { $round: ["$revenue", 2] },
          outstanding: { $round: ["$outstanding", 2] },
          billed: { $round: ["$billed", 2] },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    return NextResponse.json({ topClients });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load top clients analytics";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
