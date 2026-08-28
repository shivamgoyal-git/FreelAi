import { NextRequest, NextResponse } from "next/server";
import { getClientSession, requireClientInvoice } from "@/lib/portal-auth";
import connectDB from "@/lib/mongodb";
import Invoice from "@/models/Invoice";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const previewClientId = searchParams.get("previewClientId");

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, client, freelancerUser } = authCtx;
    await connectDB();

    // Verify invoice belongs to client (IDOR protection)
    await requireClientInvoice(clientId, id);

    const invoice = await Invoice.findById(id)
      .populate("projectId", "title category")
      .populate("clientId", "name email company phone location website")
      .lean();

    if (!invoice || invoice.status === "draft") {
      return NextResponse.json(
        { error: "Invoice not found or not published" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      invoice,
      client,
      freelancer: {
        name: freelancerUser?.name || "Freelancer",
        email: freelancerUser?.email || "",
        avatar: freelancerUser?.image || "",
      },
    });
  } catch (error: any) {
    console.error("[GET /api/portal/invoices/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch invoice" },
      { status: error.status || 500 }
    );
  }
}
