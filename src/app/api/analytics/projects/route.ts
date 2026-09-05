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

    const projects = await prisma.project.findMany({
      where: {
        userId,
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    const statusMap: Record<string, { count: number; totalBudget: number }> = {};
    const categoryMap: Record<string, { count: number; totalBudget: number }> = {};

    projects.forEach((p) => {
      const s = p.status;
      if (!statusMap[s]) statusMap[s] = { count: 0, totalBudget: 0 };
      statusMap[s].count += 1;
      statusMap[s].totalBudget += p.budget;

      const c = p.category;
      if (!categoryMap[c]) categoryMap[c] = { count: 0, totalBudget: 0 };
      categoryMap[c].count += 1;
      categoryMap[c].totalBudget += p.budget;
    });

    const statusBreakdown = Object.entries(statusMap).map(([k, v]) => ({
      _id: k,
      count: v.count,
      totalBudget: v.totalBudget,
    }));

    const categoryBreakdown = Object.entries(categoryMap).map(([k, v]) => ({
      _id: k,
      count: v.count,
      totalBudget: v.totalBudget,
    }));

    return NextResponse.json({
      statusBreakdown,
      categoryBreakdown,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load projects analytics";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
