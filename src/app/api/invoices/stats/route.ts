import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import { checkAndUpdateOverdueInvoices } from "@/utils/overdueCheck";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    await connectDB();

    // 1. Run dynamic overdue detection to ensure correct status counts
    await checkAndUpdateOverdueInvoices(userId);

    // 2. Aggregate count and financial figures using optimized queries
    const filter = { userId };
    const [
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      partiallyPaidInvoices,
      financials,
    ] = await Promise.all([
      Invoice.countDocuments(filter),
      Invoice.countDocuments({ ...filter, status: "paid" }),
      Invoice.countDocuments({ ...filter, status: "sent" }),
      Invoice.countDocuments({ ...filter, status: "overdue" }),
      Invoice.countDocuments({ ...filter, status: "partially_paid" }),
      Invoice.aggregate([
        { $match: { userId, status: { $ne: "cancelled" } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amountPaid" },
            outstandingRevenue: { $sum: "$remainingAmount" },
          },
        },
      ]),
    ]);

    const totalRevenue = financials[0]?.totalRevenue || 0;
    const outstandingRevenue = financials[0]?.outstandingRevenue || 0;

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
