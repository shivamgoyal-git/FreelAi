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

    const [invoicesInPeriod, recentInvoices, upcomingInvoices] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          userId,
          issueDate: { gte: startDate, lte: endDate },
        },
      }),
      prisma.invoice.findMany({
        where: {
          userId,
          status: { in: ["paid", "sent", "partially_paid"] },
        },
        include: { client: { select: { name: true } } },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.invoice.findMany({
        where: {
          userId,
          status: { in: ["sent", "partially_paid", "overdue"] },
          dueDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
        include: { client: { select: { name: true } } },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
    ]);

    const statusMap: Record<string, { count: number; totalValue: number }> = {};
    invoicesInPeriod.forEach((inv) => {
      const s = inv.status;
      if (!statusMap[s]) statusMap[s] = { count: 0, totalValue: 0 };
      statusMap[s].count += 1;
      statusMap[s].totalValue += inv.total;
    });

    const statusDistribution = Object.entries(statusMap).map(([k, v]) => ({
      _id: k,
      count: v.count,
      totalValue: v.totalValue,
    }));

    const recentActivity = recentInvoices.map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      status: inv.status,
      total: inv.total,
      amountPaid: inv.amountPaid,
      currency: inv.currency,
      date: inv.updatedAt,
      clientName: inv.client?.name || "Unknown Client",
    }));

    const upcomingPayments = upcomingInvoices.map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      status: inv.status,
      total: inv.total,
      remainingAmount: inv.remainingAmount,
      currency: inv.currency,
      dueDate: inv.dueDate,
      clientName: inv.client?.name || "Unknown Client",
    }));

    return NextResponse.json({
      statusDistribution,
      recentActivity,
      upcomingPayments,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load invoices analytics";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
