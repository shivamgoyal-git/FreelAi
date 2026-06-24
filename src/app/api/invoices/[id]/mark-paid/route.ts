import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import Client from "@/models/Client";
import Project from "@/models/Project";
import { logActivity } from "@/lib/activity";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

  try {
    await connectDB();
    const body = await req.json();
    const { amount } = body;

    // 1. Validation
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Payment amount must be a number greater than 0" }, { status: 400 });
    }

    const invoice = await Invoice.findOne({ _id: id, userId });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.remainingAmount <= 0) {
      return NextResponse.json({ error: "Invoice is already fully paid" }, { status: 400 });
    }

    // Cap payment at outstanding remaining balance
    const paymentAmount = Number(Math.min(amount, invoice.remainingAmount).toFixed(2));

    // 2. Update Invoice amountPaid
    invoice.amountPaid = Number((invoice.amountPaid + paymentAmount).toFixed(2));

    // Trigger pre-save hook to recalculate remainingAmount and status
    await invoice.save();

    // 3. Propagate to Client totalEarned
    if (invoice.clientId) {
      await Client.findOneAndUpdate(
        { _id: invoice.clientId, userId },
        { $inc: { totalEarned: paymentAmount } }
      );
    }

    // 4. Propagate to Project paid amount
    if (invoice.projectId) {
      await Project.findOneAndUpdate(
        { _id: invoice.projectId, userId },
        { $inc: { paid: paymentAmount } }
      );
    }

    // 5. Create Activity Log
    const activityType = invoice.status === "paid" ? "invoice_paid" : "invoice_partially_paid";
    const activityTitle = invoice.status === "paid" ? "Invoice Paid" : "Invoice Partially Paid";
    const activityDesc = invoice.status === "paid"
      ? `Received final payment of ${invoice.currency} ${paymentAmount.toLocaleString()} for Invoice ${invoice.invoiceNumber}.`
      : `Received partial payment of ${invoice.currency} ${paymentAmount.toLocaleString()} for Invoice ${invoice.invoiceNumber}. Remaining balance: ${invoice.currency} ${invoice.remainingAmount.toLocaleString()}.`;

    await logActivity(userId, activityType, activityTitle, activityDesc, invoice._id.toString());

    return NextResponse.json({
      success: true,
      paymentAmount,
      invoice,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to record payment";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
