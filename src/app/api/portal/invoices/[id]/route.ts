import { NextRequest, NextResponse } from "next/server";
import { getClientSession, requireClientInvoice } from "@/lib/portal-auth";
import { prisma } from "@/lib/prisma";

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

    // Verify invoice belongs to client (IDOR protection)
    await requireClientInvoice(clientId, id);

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, title: true, category: true } },
        client: { select: { id: true, name: true, email: true, company: true, phone: true, location: true, website: true } },
        items: true,
      },
    });

    if (!invoice || invoice.status === "draft") {
      return NextResponse.json(
        { error: "Invoice not found or not published" },
        { status: 404 }
      );
    }

    const populated = {
      ...invoice,
      _id: invoice.id,
      projectId: invoice.project ? { ...invoice.project, _id: invoice.project.id } : invoice.projectId,
      clientId: invoice.client ? { ...invoice.client, _id: invoice.client.id } : invoice.clientId,
    };

    return NextResponse.json({
      invoice: populated,
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
