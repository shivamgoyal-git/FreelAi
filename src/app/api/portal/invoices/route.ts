import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import connectDB from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import { checkAndUpdateOverdueInvoices } from "@/utils/overdueCheck";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const previewClientId = searchParams.get("previewClientId");
    const status = searchParams.get("status");
    const projectId = searchParams.get("projectId");

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, client } = authCtx;
    await connectDB();

    // Check overdue status on client's invoices
    const ownerUserId = client.userId ? client.userId.toString() : authCtx.userId;
    if (ownerUserId) {
      await checkAndUpdateOverdueInvoices(ownerUserId);
    }

    const clientQueryConditions: any[] = [
      { clientId: clientId },
    ];
    if (client.email) {
      clientQueryConditions.push({ clientEmail: client.email.toLowerCase().trim() });
    }

    const filter: Record<string, unknown> = {
      $and: [
        { $or: clientQueryConditions },
        { status: { $ne: "draft" } }, // Do not expose draft invoices to clients
      ],
    };

    if (status && status !== "all") {
      (filter.$and as any[]).push({ status });
    }
    if (projectId) {
      (filter.$and as any[]).push({ projectId });
    }

    const invoices = await Invoice.find(filter)
      .populate("projectId", "title")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ invoices });
  } catch (error: any) {
    console.error("[GET /api/portal/invoices] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch invoices" },
      { status: error.status || 500 }
    );
  }
}
