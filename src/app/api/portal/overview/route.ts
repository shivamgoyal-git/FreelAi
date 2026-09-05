import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/prisma";
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

    // 1. Fetch Client's Projects
    const projectWhere: any = {
      OR: [
        { clientId: clientId },
        ...(client.name ? [{ clientName: { equals: client.name, mode: "insensitive" } }] : []),
      ],
    };

    const [projects, pendingDeliverables, invoices, activities, unreadMessages] = await Promise.all([
      prisma.project.findMany({
        where: projectWhere,
        include: { milestones: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.deliverable.findMany({
        where: { clientId, status: "pending_review" },
      }),
      prisma.invoice.findMany({
        where: {
          clientId,
          status: { in: ["sent", "partially_paid", "overdue"] },
        },
      }),
      prisma.activity.findMany({
        where: { clientId },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.message.findMany({
        where: {
          clientId,
          senderRole: "freelancer",
          readByClient: false,
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

    const outstandingAmount = invoices.reduce(
      (sum, inv) => sum + (inv.remainingAmount ?? (inv.total - (inv.amountPaid || 0))),
      0
    );

    const now = new Date();
    const activeProjects = projects.filter((p) => p.status === "active" || p.status === "in_review");
    const upcomingDeadlines = activeProjects.filter((p) => {
      if (!p.dueDate) return false;
      const due = new Date(p.dueDate);
      const diffDays = (due.getTime() - now.getTime()) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 14;
    }).length;

    const attentionItems: ClientPortalOverview["attentionItems"] = [];

    if (pendingDeliverables.length > 0) {
      const topDeliverable = pendingDeliverables[0];
      attentionItems.push({
        id: topDeliverable.id,
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
        id: topInvoice.id,
        type: "invoice",
        title: `Invoice #${topInvoice.invoiceNumber} is pending payment`,
        subtitle: `Amount: ${topInvoice.currency || "INR"} ${(topInvoice.remainingAmount || topInvoice.total).toLocaleString()}`,
        actionLabel: "View Invoice",
        actionLink: `/portal/invoices/${topInvoice.id}`,
        urgency: topInvoice.status === "overdue" ? "high" : "medium",
      });
    }

    if (unreadMessages.length > 0) {
      const msg = unreadMessages[0];
      attentionItems.push({
        id: msg.id,
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
        _id: client.id,
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
          (d) => d.projectId === p.id
        ).length;
        const currentMilestone =
          p.milestones?.find((m) => !m.completed)?.title ||
          (p.milestones?.length ? "Final Delivery" : "In Progress");

        return {
          _id: p.id,
          title: p.title,
          category: p.category as string,
          status: p.status as string,
          progress: p.progress || 0,
          budget: p.budget || 0,
          currency: p.currency || "INR",
          dueDate: p.dueDate || undefined,
          currentMilestone,
          pendingDeliverableCount: pPending,
        };
      }),
      recentActivity: activities.map((a) => ({
        _id: a.id,
        type: a.type as string,
        title: a.title,
        description: a.description || "",
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
