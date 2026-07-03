import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
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

    const [statusBreakdown, categoryBreakdown] = await Promise.all([
      Project.aggregate([
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
            totalBudget: { $sum: "$budget" },
          },
        },
      ]),

      Project.aggregate([
        {
          $match: {
            userId,
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            totalBudget: { $sum: "$budget" },
          },
        },
      ]),
    ]);

    return NextResponse.json({
      statusBreakdown,
      categoryBreakdown,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load projects analytics";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
