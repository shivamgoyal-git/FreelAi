import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import Deliverable from "@/models/Deliverable";
import Invoice from "@/models/Invoice";
import Activity from "@/models/Activity";
import Message from "@/models/Message";
import type { ClientPortalOverview } from "@/types/portal";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const previewClientId = searchParams.get("previewClientId");

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { client, clientId, freelancerUser } = authCtx;
    await connectDB();

    // 1. Fetch Client's Projects (support string, ObjectId, clientName, or freelancer ownership)
    const projectQueryConditions: any[] = [
      { clientId: clientId },
    ];
    if (client.name) {
      projectQueryConditions.push({ clientName: client.name });
    }
    if (authCtx.role === "freelancer" && authCtx.userId) {
      projectQueryConditions.push({ userId: authCtx.userId });
    }

    const projects = await Project.find({ $or: projectQueryConditions }).sort({ updatedAt: -1 }).lean();

    // 2. Fetch Deliverables requiring approval
    const pendingDeliverables = await Deliverable.find({
      clientId,
      status: "pending_review",
    }).lean();

    // 3. Fetch Invoices for this client
    const invoices = await Invoice.find({
      clientId,
      status: { $in: ["sent", "partially_paid", "overdue"] },
    }).lean();

    const outstandingAmount = invoices.reduce(
      (sum, inv) => sum + (inv.remainingAmount ?? (inv.total - (inv.amountPaid || 0))),
      0
    );

    // 4. Calculate upcoming deadlines
    const now = new Date();
    const activeProjects = projects.filter((p) => p.status === "active" || p.status === "in_review");
    const upcomingDeadlines = activeProjects.filter((p) => {
      if (!p.dueDate) return false;
      const due = new Date(p.dueDate);
      const diffDays = (due.getTime() - now.getTime()) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 14;
    }).length;

    // 5. Fetch Recent Activity
    const activities = await Activity.find({
      $or: [{ clientId }, { userId: client.userId }],
    })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    // 6. Fetch Unread Messages
    const unreadMessages = await Message.find({
      clientId,
      senderRole: "freelancer",
      readByClient: false,
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    // 7. Assemble Attention Items
    const attentionItems: ClientPortalOverview["attentionItems"] = [];

    if (pendingDeliverables.length > 0) {
      const topDeliverable = pendingDeliverables[0];
      attentionItems.push({
        id: topDeliverable._id.toString(),
        type: "deliverable",
        title: `${pendingDeliverables.length} deliverable${
          pendingDeliverables.length > 1 ? "s" : ""
        } need${pendingDeliverables.length === 1 ? "s" : ""} your review`,
        subtitle: `"${topDeliverable.title}" is ready for approval.`,
        actionLabel: "Review Now",
        actionLink: `/portal/projects/${topDeliverable.projectId}?tab=deliverables`,
        urgency: "high",
      });
    }

    if (invoices.length > 0) {
      const topInvoice = invoices[0];
      attentionItems.push({
        id: topInvoice._id.toString(),
        type: "invoice",
        title: `Invoice #${topInvoice.invoiceNumber} is pending payment`,
        subtitle: `Amount: ${topInvoice.currency || "INR"} ${(topInvoice.remainingAmount || topInvoice.total).toLocaleString()}`,
        actionLabel: "View Invoice",
        actionLink: `/portal/invoices/${topInvoice._id}`,
        urgency: topInvoice.status === "overdue" ? "high" : "medium",
      });
    }

    if (unreadMessages.length > 0) {
      const msg = unreadMessages[0];
      attentionItems.push({
        id: msg._id.toString(),
        type: "message",
        title: "New message from your freelancer",
        subtitle: msg.content.length > 60 ? `${msg.content.slice(0, 60)}...` : msg.content,
        actionLabel: "Open Messages",
        actionLink: `/portal/messages?project=${msg.projectId}`,
        urgency: "low",
      });
    }

    const payload: ClientPortalOverview = {
      client: {
        _id: client._id.toString(),
        name: client.name,
        email: client.email,
        company: client.company || "",
        avatar: client.avatar || "",
      },
      freelancer: {
        name: freelancerUser?.name || "Your Freelancer",
        email: freelancerUser?.email || "",
        company: (freelancerUser as any)?.company || "FreeAI Studio",
        avatar: freelancerUser?.image || "",
      },
      stats: {
        activeProjects: activeProjects.length,
        pendingApprovals: pendingDeliverables.length,
        outstandingAmount,
        upcomingDeadlines,
        currency: projects[0]?.currency || "INR",
      },
      attentionItems,
      projects: projects.map((p) => {
        const pPending = pendingDeliverables.filter(
          (d) => d.projectId.toString() === p._id.toString()
        ).length;
        const currentMilestone =
          p.milestones?.find((m: any) => !m.completed)?.title ||
          (p.milestones?.length ? "Final Delivery" : "In Progress");

        return {
          _id: p._id.toString(),
          title: p.title,
          category: p.category,
          status: p.status,
          progress: p.progress || 0,
          budget: p.budget || 0,
          currency: p.currency || "INR",
          dueDate: p.dueDate,
          currentMilestone,
          pendingDeliverableCount: pPending,
        };
      }),
      recentActivity: activities.map((a) => ({
        _id: a._id.toString(),
        type: a.type,
        title: a.title,
        description: a.description,
        createdAt: a.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error("[GET /api/portal/overview] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch client portal overview" },
      { status: error.status || 500 }
    );
  }
}
