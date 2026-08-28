import { NextRequest, NextResponse } from "next/server";
import { getClientSession, requireClientInvoice } from "@/lib/portal-auth";
import connectDB from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import Project from "@/models/Project";
import Client from "@/models/Client";
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
    await connectDB();

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

    // Update invoice
    invoice.amountPaid = invoice.total;
    invoice.remainingAmount = 0;
    invoice.status = "paid";
    await invoice.save();

    // Update Project financials if linked
    if (invoice.projectId) {
      const project = await Project.findById(invoice.projectId);
      if (project) {
        // Recalculate total paid from all paid invoices for this project
        const projectPaidInvoices = await Invoice.find({
          projectId: invoice.projectId,
          status: "paid",
        });
        const totalPaid = projectPaidInvoices.reduce(
          (sum, inv) => sum + (inv.amountPaid || inv.total),
          0
        );
        project.paid = totalPaid;
        await project.save();
      }
    }

    // Update Client total earned
    const allPaidClientInvoices = await Invoice.find({
      clientId: invoice.clientId,
      status: "paid",
    });
    const clientEarned = allPaidClientInvoices.reduce(
      (sum, inv) => sum + (inv.amountPaid || inv.total),
      0
    );
    await Client.findByIdAndUpdate(invoice.clientId, {
      $set: { totalEarned: clientEarned },
    });

    // Notify Freelancer
    await sendNotification({
      recipientId: invoice.userId,
      recipientRole: "freelancer",
      title: "Payment Received",
      message: `Payment of ${invoice.currency || "INR"} ${paymentAmount.toLocaleString()} received from ${client.name} for Invoice #${invoice.invoiceNumber}.`,
      type: "invoice_paid",
      link: `/dashboard/invoices/${invoice._id}`,
      invoiceId: invoice._id,
      projectId: invoice.projectId || undefined,
    });

    // Record Activity
    await recordActivity({
      userId: invoice.userId,
      type: "invoice_paid",
      title: "Invoice Paid",
      description: `Received payment of ${invoice.currency || "INR"} ${paymentAmount.toLocaleString()} for Invoice #${invoice.invoiceNumber} (${client.name}). Method: ${paymentMethod}. Ref: ${transactionRef || "SIMULATED_TXN"}`,
      invoiceId: invoice._id,
      projectId: invoice.projectId || undefined,
      clientId: invoice.clientId,
      actorRole: "client",
    });

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
      invoice,
    });
  } catch (error: any) {
    console.error("[POST /api/portal/invoices/[id]/pay] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process payment" },
      { status: error.status || 500 }
    );
  }
}
