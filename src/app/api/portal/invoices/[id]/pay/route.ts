import { NextRequest, NextResponse } from "next/server";
import { getClientSession, requireClientInvoice } from "@/lib/portal-auth";
import { prisma } from "@/lib/prisma";
import { sendNotification, recordActivity } from "@/lib/portal-notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { paymentMethod = "card", transactionRef, previewClientId } = body;

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, client } = authCtx;

    // Verify ownership
    const invoice = await requireClientInvoice(clientId, id);

    if (invoice.status === "paid") {
      return NextResponse.json(
        { error: "Invoice is already paid" },
        { status: 400 }
      );
    }

    if (invoice.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot pay a cancelled invoice" },
        { status: 400 }
      );
    }

    const paymentAmount = invoice.remainingAmount > 0 ? invoice.remainingAmount : invoice.total;

    // Update invoice in Prisma
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        amountPaid: invoice.total,
        remainingAmount: 0,
        status: "paid",
      },
    });

    // Update Project financials if linked
    if (invoice.projectId) {
      const projectPaidInvoices = await prisma.invoice.findMany({
        where: { projectId: invoice.projectId, status: "paid" },
      });
      const totalPaid = projectPaidInvoices.reduce(
        (sum, inv) => sum + (inv.amountPaid || inv.total),
        0
      );
      await prisma.project.update({
        where: { id: invoice.projectId },
        data: { paid: totalPaid },
      });
    }

    // Update Client total earned
    const allPaidClientInvoices = await prisma.invoice.findMany({
      where: { clientId: invoice.clientId, status: "paid" },
    });
    const clientEarned = allPaidClientInvoices.reduce(
      (sum, inv) => sum + (inv.amountPaid || inv.total),
      0
    );
    await prisma.client.update({
      where: { id: invoice.clientId },
      data: { totalEarned: clientEarned },
    });

    // Notify Freelancer
    await sendNotification({
      recipientId: invoice.userId,
      recipientRole: "freelancer",
      title: "Payment Received",
      message: `Payment of ${invoice.currency || "INR"} ${paymentAmount.toLocaleString()} received from ${client.name} for Invoice #${invoice.invoiceNumber}.`,
      type: "invoice_paid",
      link: `/dashboard/invoices/${invoice.id}`,
      invoiceId: invoice.id,
      projectId: invoice.projectId || undefined,
    });

    // Record Activity
    await recordActivity({
      userId: invoice.userId,
      type: "invoice_paid",
      title: "Invoice Paid",
      description: `Received payment of ${invoice.currency || "INR"} ${paymentAmount.toLocaleString()} for Invoice #${invoice.invoiceNumber} (${client.name}). Method: ${paymentMethod}. Ref: ${transactionRef || "SIMULATED_TXN"}`,
      invoiceId: invoice.id,
      projectId: invoice.projectId || undefined,
      clientId: invoice.clientId,
      actorRole: "client",
    });

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
      invoice: { ...updatedInvoice, _id: updatedInvoice.id },
    });
  } catch (error: any) {
    console.error("[POST /api/portal/invoices/[id]/pay] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process payment" },
      { status: error.status || 500 }
    );
  }
}
