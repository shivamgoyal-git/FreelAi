import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const previewClientId = searchParams.get("previewClientId");
    const status = searchParams.get("status") || "";
    const q = searchParams.get("q") || "";

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, client } = authCtx;

    const where: any = {
      AND: [
        {
          OR: [
            { clientId: clientId },
            ...(client.name ? [{ clientName: { equals: client.name, mode: "insensitive" } }] : []),
          ],
        },
      ],
    };

    if (status && status !== "all") {
      where.AND.push({ status });
    }
    if (q) {
      where.AND.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    const projects = await prisma.project.findMany({
      where,
      include: { milestones: true },
      orderBy: { createdAt: "desc" },
    });

    const projectIds = projects.map((p) => p.id);
    const [deliverables, invoices] = await Promise.all([
      prisma.deliverable.findMany({ where: { projectId: { in: projectIds } } }),
      prisma.invoice.findMany({ where: { projectId: { in: projectIds } } }),
    ]);

    const enrichedProjects = projects.map((p) => {
      const pDeliverables = deliverables.filter((d) => d.projectId === p.id);
      const pInvoices = invoices.filter((i) => i.projectId === p.id);

      const pendingDeliverables = pDeliverables.filter((d) => d.status === "pending_review");
      const outstandingInvoice = pInvoices.find(
        (i) => i.status === "sent" || i.status === "partially_paid" || i.status === "overdue"
      );

      const currentMilestone =
        p.milestones?.find((m) => !m.completed)?.title ||
        (p.milestones?.length ? "Final Delivery" : "In Progress");

      return {
        ...p,
        _id: p.id,
        currentMilestone,
        pendingDeliverablesCount: pendingDeliverables.length,
        hasOutstandingInvoice: !!outstandingInvoice,
        outstandingInvoiceAmount: outstandingInvoice
          ? outstandingInvoice.remainingAmount || outstandingInvoice.total
          : 0,
      };
    });

    return NextResponse.json({ projects: enrichedProjects });
  } catch (error: any) {
    console.error("[GET /api/portal/projects] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch projects" },
      { status: error.status || 500 }
    );
  }
}
