import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Activity from "@/models/Activity";
import { logActivity } from "@/lib/activity";
import { ActivityType } from "@/models/Activity";

type Params = { params: Promise<{ id: string }> };

// ── GET /api/invoices/[id] — Fetch single invoice ──────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

  try {
    await connectDB();

    const invoice = await Invoice.findOne({ _id: id, userId })
      .populate("clientId", "name email company")
      .populate("projectId", "title category");

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Dynamic overdue detection:
    // If the invoice is past due date, unpaid/partially paid, and not marked overdue yet, save to update status
    const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date();
    if (isOverdue && ["sent", "partially_paid"].includes(invoice.status)) {
      invoice.status = "overdue";
      await invoice.save();
      
      // Log overdue activity
      await logActivity(
        userId,
        "invoice_overdue",
        `Invoice ${invoice.invoiceNumber} is Overdue`,
        `Invoice ${invoice.invoiceNumber} has passed its due date of ${invoice.dueDate.toLocaleDateString()}. Remaining balance: ${invoice.currency} ${invoice.remainingAmount}`,
        invoice._id.toString()
      );
    }

    // Fetch related activities for history tracking
    const activities = await Activity.find({ userId, invoiceId: id }).sort({ createdAt: 1 }).lean();

    return NextResponse.json({ invoice, activities });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch invoice";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── PATCH /api/invoices/[id] — Update invoice ──────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

  try {
    await connectDB();
    const body = await req.json();

    // Prevent direct update of read-only calculated fields or userId via patch
    const restrictedFields = [
      "_id",
      "userId",
      "subtotal",
      "taxAmount",
      "total",
      "amountPaid",
      "remainingAmount",
    ];
    restrictedFields.forEach((field) => delete body[field]);

    const invoice = await Invoice.findOne({ _id: id, userId });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const previousStatus = invoice.status;

    // Validate and update relation IDs if they are modified
    if (body.clientId && body.clientId !== invoice.clientId.toString()) {
      const clientExists = await Client.findOne({ _id: body.clientId, userId });
      if (!clientExists) {
        return NextResponse.json({ error: "Client not found or access denied" }, { status: 404 });
      }
    }
    if (body.projectId && body.projectId !== invoice.projectId?.toString()) {
      const projectExists = await Project.findOne({ _id: body.projectId, userId });
      if (!projectExists) {
        return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
      }
    }

    // Apply values to Mongoose document instance
    Object.keys(body).forEach((key) => {
      // Handle date conversion
      if (key === "issueDate" || key === "dueDate") {
        invoice.set(key, new Date(body[key]));
      } else {
        invoice.set(key, body[key]);
      }
    });

    // Save document to trigger pre-save hook (computes totals/resolves status)
    await invoice.save();

    // Log status transitions if status changed
    if (invoice.status !== previousStatus) {
      let activityType: ActivityType = "invoice_created";
      let activityTitle = "Invoice Updated";
      const activityDesc = `Invoice ${invoice.invoiceNumber} status changed from ${previousStatus} to ${invoice.status}.`;

      if (invoice.status === "sent") {
        activityType = "invoice_sent";
        activityTitle = "Invoice Sent";
      } else if (invoice.status === "cancelled") {
        activityType = "invoice_cancelled";
        activityTitle = "Invoice Cancelled";
      }

      await logActivity(userId, activityType, activityTitle, activityDesc, invoice._id.toString());
    }

    return NextResponse.json({ invoice });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update invoice";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// ── DELETE /api/invoices/[id] — Delete invoice ─────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

  try {
    await connectDB();

    const invoice = await Invoice.findOne({ _id: id, userId });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Revert earnings/paid stats on related Client and Project if deleting a paid/partially paid invoice
    if (invoice.amountPaid > 0) {
      if (invoice.clientId) {
        await Client.findOneAndUpdate(
          { _id: invoice.clientId, userId },
          { $inc: { totalEarned: -invoice.amountPaid } }
        );
      }
      if (invoice.projectId) {
        await Project.findOneAndUpdate(
          { _id: invoice.projectId, userId },
          { $inc: { paid: -invoice.amountPaid } }
        );
      }
    }

    await Invoice.deleteOne({ _id: id, userId });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete invoice";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
