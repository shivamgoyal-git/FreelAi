import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/prisma";
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

    // Check overdue status
    const ownerUserId = client.userId || authCtx.userId;
    if (ownerUserId) {
      await checkAndUpdateOverdueInvoices(ownerUserId);
    }

    const where: any = {
      clientId,
      status: { not: "draft" },
    };

    if (status && status !== "all") {
      where.status = status;
    }
    if (projectId) {
      where.projectId = projectId;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        project: { select: { title: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      invoices: invoices.map((inv) => ({
        ...inv,
        _id: inv.id,
        projectId: inv.project ? { title: inv.project.title, _id: inv.projectId } : inv.projectId,
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/portal/invoices] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch invoices" },
      { status: error.status || 500 }
    );
  }
}
