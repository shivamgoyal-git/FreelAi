import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import Deliverable from "@/models/Deliverable";
import Invoice from "@/models/Invoice";

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
    await connectDB();

    const clientQueryConditions: any[] = [
      { clientId: clientId },
    ];
    if (client.name) {
      clientQueryConditions.push({ clientName: client.name });
    }
    if (authCtx.role === "freelancer" && authCtx.userId) {
      clientQueryConditions.push({ userId: authCtx.userId });
    }

    const filter: Record<string, unknown> = {
      $and: [
        { $or: clientQueryConditions }
      ]
    };

    if (status && status !== "all") {
      (filter.$and as any[]).push({ status });
    }
    if (q) {
      (filter.$and as any[]).push({
        $or: [
          { title: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
        ],
      });
    }

    const projects = await Project.find(filter).sort({ createdAt: -1 }).lean();

    // Attach pending deliverables & active invoice status
    const projectIds = projects.map((p) => p._id);
    const [deliverables, invoices] = await Promise.all([
      Deliverable.find({ projectId: { $in: projectIds } }).lean(),
      Invoice.find({ projectId: { $in: projectIds } }).lean(),
    ]);

    const enrichedProjects = projects.map((p) => {
      const pDeliverables = deliverables.filter(
        (d) => d.projectId.toString() === p._id.toString()
      );
      const pInvoices = invoices.filter(
        (i) => i.projectId?.toString() === p._id.toString()
      );

      const pendingDeliverables = pDeliverables.filter(
        (d) => d.status === "pending_review"
      );
      const outstandingInvoice = pInvoices.find(
        (i) => i.status === "sent" || i.status === "partially_paid" || i.status === "overdue"
      );

      const currentMilestone =
        p.milestones?.find((m: any) => !m.completed)?.title ||
        (p.milestones?.length ? "Final Delivery" : "In Progress");

      return {
        ...p,
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
