import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InvoicesService } from "@/services/invoices.service";
import { logActivity } from "@/lib/activity";
import { checkAndUpdateOverdueInvoices } from "@/utils/overdueCheck";

// ── GET /api/invoices — List user's invoices ──────────────────
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // 1. Run automatic overdue detection first
    await checkAndUpdateOverdueInvoices(userId);

    // 2. Parse query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const clientId = searchParams.get("clientId") || "";
    const projectId = searchParams.get("projectId") || "";
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder: "asc" | "desc" = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const allowedSortFields = ["createdAt", "dueDate", "total"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const where: any = { userId };
    if (status && status !== "all") where.status = status;
    if (clientId) where.clientId = clientId;
    if (projectId) where.projectId = projectId;
    if (q) {
      where.invoiceNumber = { contains: q, mode: "insensitive" };
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, email: true, company: true } },
          project: { select: { id: true, title: true, category: true } },
          items: true,
        },
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    const populated = invoices.map((inv) => ({
      ...inv,
      _id: inv.id,
      clientId: inv.client ? { ...inv.client, _id: inv.client.id } : inv.clientId,
      projectId: inv.project ? { ...inv.project, _id: inv.project.id } : inv.projectId,
    }));

    return NextResponse.json({ invoices: populated, total, page, limit });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch invoices";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── POST /api/invoices — Create a new invoice ──────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    const {
      invoiceNumber,
      clientId,
      projectId,
      issueDate,
      dueDate,
      items,
      discount,
      taxRate,
      currency,
      notes,
      paymentTerms,
      status,
    } = body;

    if (!invoiceNumber) {
      return NextResponse.json({ error: "Invoice number is required" }, { status: 400 });
    }
    if (!clientId) {
      return NextResponse.json({ error: "Client is required" }, { status: 400 });
    }
    if (!issueDate || !dueDate) {
      return NextResponse.json({ error: "Issue date and due date are required" }, { status: 400 });
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, userId },
    });
    if (!client) {
      return NextResponse.json({ error: "Client not found or access denied" }, { status: 404 });
    }

    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
      });
      if (!project) {
        return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
      }
    }

    const invoice = await InvoicesService.createInvoice(userId, {
      invoiceNumber,
      clientId,
      projectId,
      issueDate,
      dueDate,
      items,
      discount,
      taxRate,
      currency,
      notes,
      paymentTerms,
      status,
    });

    const activityType = invoice.status === "sent" ? "invoice_sent" : "invoice_created";
    const activityTitle = invoice.status === "sent" ? "Invoice Sent" : "Invoice Created";
    const activityDesc = invoice.status === "sent"
      ? `Invoice ${invoice.invoiceNumber} sent to client "${client.name}" for ${invoice.currency} ${invoice.total}.`
      : `Invoice ${invoice.invoiceNumber} created for client "${client.name}" in draft.`;

    await logActivity(userId, activityType, activityTitle, activityDesc, invoice.id);

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create invoice";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
