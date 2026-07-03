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

    const [statusDistribution, recentActivity, upcomingPayments] = await Promise.all([
      Invoice.aggregate([
        {
          $match: {
            userId,
            issueDate: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalValue: { $sum: "$total" },
          },
        },
      ]),

      Invoice.aggregate([
        {
          $match: {
            userId,
            status: { $in: ["paid", "sent", "partially_paid"] },
          },
        },
        { $sort: { updatedAt: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "clients",
            localField: "clientId",
            foreignField: "_id",
            as: "client",
          },
        },
        { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            invoiceNumber: 1,
            status: 1,
            total: 1,
            amountPaid: 1,
            currency: 1,
            date: "$updatedAt",
            clientName: { $ifNull: ["$client.name", "Unknown Client"] },
          },
        },
      ]),

      Invoice.aggregate([
        {
          $match: {
            userId,
            status: { $in: ["sent", "partially_paid", "overdue"] },
            dueDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        },
        { $sort: { dueDate: 1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "clients",
            localField: "clientId",
            foreignField: "_id",
            as: "client",
          },
        },
        { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            invoiceNumber: 1,
            status: 1,
            total: 1,
            remainingAmount: 1,
            currency: 1,
            dueDate: 1,
            clientName: { $ifNull: ["$client.name", "Unknown Client"] },
          },
        },
      ]),
    ]);

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
