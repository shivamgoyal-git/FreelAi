import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAndUpdateOverdueInvoices } from "@/utils/overdueCheck";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // 1. Run dynamic overdue detection
    await checkAndUpdateOverdueInvoices(userId);

    // 2. Aggregate count and financial figures
    const filter = { userId };
    const [
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      partiallyPaidInvoices,
      allInvoices,
    ] = await Promise.all([
      prisma.invoice.count({ where: filter }),
      prisma.invoice.count({ where: { ...filter, status: "paid" } }),
      prisma.invoice.count({ where: { ...filter, status: "sent" } }),
      prisma.invoice.count({ where: { ...filter, status: "overdue" } }),
      prisma.invoice.count({ where: { ...filter, status: "partially_paid" } }),
      prisma.invoice.findMany({
        where: { userId, status: { not: "cancelled" } },
        select: { amountPaid: true, remainingAmount: true },
      }),
    ]);

    let totalRevenue = 0;
    let outstandingRevenue = 0;

    for (const inv of allInvoices) {
      totalRevenue += inv.amountPaid;
      outstandingRevenue += inv.remainingAmount;
    }

    return NextResponse.json({
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      partiallyPaidInvoices,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      outstandingRevenue: Number(outstandingRevenue.toFixed(2)),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch stats";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
