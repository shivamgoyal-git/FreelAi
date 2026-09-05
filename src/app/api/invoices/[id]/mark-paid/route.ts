import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InvoicesService } from "@/services/invoices.service";
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
    const body = await req.json();
    const { amount } = body;

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Payment amount must be a number greater than 0" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
    });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.remainingAmount <= 0) {
      return NextResponse.json({ error: "Invoice is already fully paid" }, { status: 400 });
    }

    const paymentAmount = Number(Math.min(amount, invoice.remainingAmount).toFixed(2));
    const newAmountPaid = Number((invoice.amountPaid + paymentAmount).toFixed(2));

    const updated = await InvoicesService.updateInvoice(id, userId, {
      amountPaid: newAmountPaid,
    });

    if (!updated) {
      return NextResponse.json({ error: "Failed to update payment" }, { status: 400 });
    }

    // Propagate to Client totalEarned
    if (invoice.clientId) {
      await prisma.client.update({
        where: { id: invoice.clientId },
        data: { totalEarned: { increment: paymentAmount } },
      });
    }

    // Propagate to Project paid amount
    if (invoice.projectId) {
      await prisma.project.update({
        where: { id: invoice.projectId },
        data: { paid: { increment: paymentAmount } },
      });
    }

    const activityType = updated.status === "paid" ? "invoice_paid" : "invoice_partially_paid";
    const activityTitle = updated.status === "paid" ? "Invoice Paid" : "Invoice Partially Paid";
    const activityDesc = updated.status === "paid"
      ? `Received final payment of ${updated.currency} ${paymentAmount.toLocaleString()} for Invoice ${updated.invoiceNumber}.`
      : `Received partial payment of ${updated.currency} ${paymentAmount.toLocaleString()} for Invoice ${updated.invoiceNumber}. Remaining balance: ${updated.currency} ${updated.remainingAmount.toLocaleString()}.`;

    await logActivity(userId, activityType, activityTitle, activityDesc, updated.id);

    return NextResponse.json({
      success: true,
      paymentAmount,
      invoice: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to record payment";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
