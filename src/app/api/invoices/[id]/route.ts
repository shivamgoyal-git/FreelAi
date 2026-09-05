import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InvoicesService } from "@/services/invoices.service";
import { logActivity } from "@/lib/activity";

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
    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
        project: { select: { id: true, title: true, category: true } },
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date();
    if (isOverdue && ["sent", "partially_paid"].includes(invoice.status)) {
      await prisma.invoice.update({
        where: { id },
        data: { status: "overdue" },
      });
      invoice.status = "overdue";

      await logActivity(
        userId,
        "invoice_overdue",
        `Invoice ${invoice.invoiceNumber} is Overdue`,
        `Invoice ${invoice.invoiceNumber} has passed its due date of ${new Date(invoice.dueDate).toLocaleDateString()}. Remaining balance: ${invoice.currency} ${invoice.remainingAmount}`,
        invoice.id
      );
    }

    const activities = await prisma.activity.findMany({
      where: { userId, invoiceId: id },
      orderBy: { createdAt: "asc" },
    });

    const populated = {
      ...invoice,
      _id: invoice.id,
      clientId: invoice.client ? { ...invoice.client, _id: invoice.client.id } : invoice.clientId,
      projectId: invoice.project ? { ...invoice.project, _id: invoice.project.id } : invoice.projectId,
    };

    return NextResponse.json({
      invoice: populated,
      activities: activities.map((a) => ({ ...a, _id: a.id })),
    });
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
    const body = await req.json();

    const existing = await prisma.invoice.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const previousStatus = existing.status;
    const updated = await InvoicesService.updateInvoice(id, userId, body);

    if (!updated) {
      return NextResponse.json({ error: "Failed to update invoice" }, { status: 400 });
    }

    if (updated.status !== previousStatus) {
      let activityType = "invoice_created";
      let activityTitle = "Invoice Updated";
      const activityDesc = `Invoice ${updated.invoiceNumber} status changed from ${previousStatus} to ${updated.status}.`;

      if (updated.status === "sent") {
        activityType = "invoice_sent";
        activityTitle = "Invoice Sent";
      } else if (updated.status === "cancelled") {
        activityType = "invoice_cancelled";
        activityTitle = "Invoice Cancelled";
      }

      await logActivity(userId, activityType, activityTitle, activityDesc, updated.id);
    }

    return NextResponse.json({ invoice: updated });
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
    const invoice = await prisma.invoice.findFirst({ where: { id, userId } });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.amountPaid > 0) {
      if (invoice.clientId) {
        await prisma.client.update({
          where: { id: invoice.clientId },
          data: { totalEarned: { decrement: invoice.amountPaid } },
        });
      }
      if (invoice.projectId) {
        await prisma.project.update({
          where: { id: invoice.projectId },
          data: { paid: { decrement: invoice.amountPaid } },
        });
      }
    }

    await prisma.invoice.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete invoice";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
