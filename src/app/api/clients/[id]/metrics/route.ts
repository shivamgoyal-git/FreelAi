import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const client = await prisma.client.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // 1. Calculate active projects
    const activeProjects = await prisma.project.count({
      where: {
        userId: session.user.id,
        clientId: id,
        status: { in: ["active", "in_review", "on_hold"] },
      },
    });

    // 2. Calculate outstanding invoices and balance
    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
        clientId: id,
        status: { in: ["sent", "partially_paid", "overdue"] },
      },
      select: { remainingAmount: true },
    });

    const outstandingInvoices = unpaidInvoices.length;
    const outstandingBalance = unpaidInvoices.reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);

    // 3. Lifetime revenue
    const lifetimeRevenue = client.totalEarned || 0;

    // 4. AI Relationship Health Score
    const aiRelationshipScore = client.rating ? client.rating * 20 : 85;

    // 5. Query recent activities
    const dbActivities = await prisma.activity.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { clientId: id },
          { description: { contains: client.name, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    const activities = dbActivities.map((act) => ({
      title: act.title,
      description: act.description,
      createdAt: act.createdAt,
    }));

    if (activities.length === 0) {
      activities.push({
        title: "Client Added",
        description: `${client.name} was added to the workspace.`,
        createdAt: client.createdAt || new Date(),
      });
      if (activeProjects > 0) {
        activities.push({
          title: "Project Initialized",
          description: `Active projects set up for ${client.name}.`,
          createdAt: client.createdAt || new Date(),
        });
      }
    }

    // 6. Generate AI Insights
    const winRate = client.rating ? 50 + client.rating * 10 : 80;
    const insights = {
      trusted: aiRelationshipScore >= 80,
      paymentReliability: outstandingInvoices === 0 ? "High" : outstandingBalance > 50000 ? "Low" : "Moderate",
      proposalWinRate: `${winRate}%`,
      relationshipHealth: aiRelationshipScore >= 85 ? "Excellent" : aiRelationshipScore >= 70 ? "Good" : "Needs Attention",
      riskIndicator: outstandingInvoices > 1 ? "Overdue Invoices" : "None",
      recommendedNextAction: outstandingInvoices > 0
        ? `Follow up on outstanding balance of $${outstandingBalance.toLocaleString()}`
        : activeProjects === 0
        ? "Pitch a new retainership proposal"
        : "Schedule status alignment meeting",
    };

    return NextResponse.json({
      metrics: {
        activeProjects,
        outstandingInvoices,
        outstandingBalance,
        lifetimeRevenue,
        aiRelationshipScore,
        activities,
        insights,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to calculate client metrics";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
