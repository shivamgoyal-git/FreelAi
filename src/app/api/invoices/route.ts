import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import Client from "@/models/Client";
import Project from "@/models/Project";
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
    await connectDB();

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

    // Sorting parameters
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // Validate sortBy field to prevent injection/errors
    const allowedSortFields = ["createdAt", "dueDate", "total"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    // 3. Build filter query
    const filter: Record<string, unknown> = { userId };
    if (status) filter.status = status;
    if (clientId) filter.clientId = clientId;
    if (projectId) filter.projectId = projectId;
    if (q) {
      filter.invoiceNumber = { $regex: q, $options: "i" };
    }

    // 4. Fetch invoices with population and pagination
    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate("clientId", "name email company")
        .populate("projectId", "title category")
        .lean(),
      Invoice.countDocuments(filter),
    ]);

    return NextResponse.json({ invoices, total, page, limit });
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
    await connectDB();
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

    // 1. Basic validations
    if (!invoiceNumber) {
      return NextResponse.json({ error: "Invoice number is required" }, { status: 400 });
    }
    if (!clientId) {
      return NextResponse.json({ error: "Client is required" }, { status: 400 });
    }
    if (!issueDate || !dueDate) {
      return NextResponse.json({ error: "Issue date and due date are required" }, { status: 400 });
    }

    // 2. Validate client ownership
    const client = await Client.findOne({ _id: clientId, userId });
    if (!client) {
      return NextResponse.json({ error: "Client not found or access denied" }, { status: 404 });
    }

    // 3. Validate project ownership (if linked)
    if (projectId) {
      const project = await Project.findOne({ _id: projectId, userId });
      if (!project) {
        return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
      }
    }

    // 4. Create and save the Invoice (pre-save hook computes all server totals)
    const invoice = new Invoice({
      userId,
      invoiceNumber,
      clientId,
      projectId: projectId || null,
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate),
      items: items || [],
      discount: discount || 0,
      taxRate: taxRate || 0,
      currency: currency || "INR",
      notes: notes || "",
      paymentTerms: paymentTerms || "",
      status: status || "draft",
      amountPaid: 0, // initially 0, payment handled via mark-paid endpoint
    });

    await invoice.save();

    // 5. Create activity logs
    const activityType = invoice.status === "sent" ? "invoice_sent" : "invoice_created";
    const activityTitle = invoice.status === "sent" ? "Invoice Sent" : "Invoice Created";
    const activityDesc = invoice.status === "sent"
      ? `Invoice ${invoice.invoiceNumber} sent to client "${client.name}" for ${invoice.currency} ${invoice.total}.`
      : `Invoice ${invoice.invoiceNumber} created for client "${client.name}" in draft.`;

    await logActivity(userId, activityType, activityTitle, activityDesc, invoice._id.toString());

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create invoice";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
