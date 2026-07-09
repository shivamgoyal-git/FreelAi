import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Activity from "@/models/Activity";
import Invoice from "@/models/Invoice";
import Proposal from "@/models/Proposal";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  await connectDB();

  try {
    // 1. Fetch total clients
    const totalClients = await Client.countDocuments({ userId });
    const clients = await Client.find({ userId }).lean();

    // 2. Fetch projects for metrics & chart
    const projects = await Project.find({ userId }).lean();

    const activeStatuses = ["active", "in_review", "on_hold"];
    const activeProjectsList = projects.filter((p) => activeStatuses.includes(p.status));
    const activeProjects = activeProjectsList.length;

    let totalRevenue = 0;
    let pendingInvoices = 0;

    projects.forEach((p) => {
      totalRevenue += p.paid || 0;
      if (p.budget > p.paid && p.status !== "cancelled") {
        pendingInvoices += (p.budget - p.paid);
      }
    });

    // 3. Fetch Invoices for advanced billing metrics
    const invoices = await Invoice.find({ userId }).lean();
    let actualPaidRevenue = 0;
    let pendingInvoicesSum = 0;
    let overdueInvoicesSum = 0;
    let overdueInvoicesCount = 0;

    invoices.forEach((inv) => {
      actualPaidRevenue += inv.amountPaid || 0;
      if (inv.status === "overdue") {
        overdueInvoicesSum += inv.remainingAmount || 0;
        overdueInvoicesCount += 1;
      } else if (inv.status === "sent" || inv.status === "partially_paid") {
        pendingInvoicesSum += inv.remainingAmount || 0;
      }
    });

    // 4. Fetch Proposals for performance metrics
    const proposals = await Proposal.find({ userId }).lean();
    const totalProposals = proposals.length;
    const wonProposalsCount = proposals.filter((p) => p.status === "won").length;
    const lostProposalsCount = proposals.filter((p) => p.status === "lost").length;
    const sentProposalsCount = proposals.filter((p) => p.status === "sent").length;
    const draftProposalsCount = proposals.filter((p) => p.status === "draft").length;

    let totalScore = 0;
    let scoredProposalsCount = 0;
    proposals.forEach((p) => {
      const activeVersion = p.versions?.[p.activeVersionIndex];
      const score = activeVersion?.scoreBreakdown?.overall;
      if (typeof score === "number") {
        totalScore += score;
        scoredProposalsCount += 1;
      }
    });
    const averageAiScore = scoredProposalsCount > 0 ? Math.round(totalScore / scoredProposalsCount) : 0;
    const conversionRate = totalProposals > 0 ? Math.round((wonProposalsCount / totalProposals) * 100) : 0;

    // 5. Generate chart data (group earnings by month)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = months.map((m) => ({ month: m, earnings: 0, projects: 0 }));

    const currentYear = new Date().getFullYear();

    projects.forEach((p) => {
      const date = p.createdAt ? new Date(p.createdAt) : new Date();
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth(); // 0-11
        if (monthIndex >= 0 && monthIndex < 12) {
          chartData[monthIndex].earnings += p.paid || 0;
          chartData[monthIndex].projects += 1;
        }
      }
    });

    // 6. Fetch activities
    let activities = await Activity.find({ userId }).sort({ createdAt: -1 }).limit(10).lean();

    // Auto-seed activities for new users to show dynamic dashboard capabilities immediately
    if (activities.length === 0) {
      const seedActivities = [
        {
          userId,
          type: "invoice_paid",
          title: "Invoice paid",
          description: "Received payment of $4,500 from NovaPlex Media for Motion Reel project.",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
          userId,
          type: "antigravity_prompt",
          title: "Antigravity Prompt run",
          description: "Optimized cold outreach message and pitch for 'Bloom Studio Website Redesign'.",
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        },
        {
          userId,
          type: "proposal_generated",
          title: "Proposal generated",
          description: "AI-powered proposal generated for 'Acme Branding Pack'. Budget: $3,200.",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
          userId,
          type: "client_added",
          title: "Client added",
          description: "Velo Commerce has been added as a new client.",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
      ];

      await Activity.insertMany(seedActivities);
      activities = await Activity.find({ userId }).sort({ createdAt: -1 }).limit(10).lean();
    }

    // 7. Get recent 5 active projects to display on the dashboard table
    const recentProjects = projects
      .sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      })
      .slice(0, 5);

    // 8. Upcoming Deadlines (within the next 14 days)
    const upcomingDeadlines: any[] = [];
    let atRiskCount = 0;
    const now = new Date();
    const twoWeeksFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    activeProjectsList.forEach((p) => {
      if (p.dueDate) {
        const due = new Date(p.dueDate);
        const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        
        if (due >= now && due <= twoWeeksFromNow) {
          upcomingDeadlines.push({
            projectId: p._id,
            title: p.title,
            dueDate: p.dueDate,
            daysLeft,
            progress: p.progress,
            clientName: p.clientName || "Direct Client",
          });
        }

        // Project risk evaluation
        if (daysLeft <= 7 && p.progress < 50) {
          atRiskCount += 1;
        } else if (daysLeft <= 14 && p.progress < 20) {
          atRiskCount += 1;
        }
      }
    });
    upcomingDeadlines.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    // 9. Client Intelligence
    const clientIntelligenceList = clients.map((c) => {
      const clientProjects = projects.filter((p) => p.clientId?.toString() === c._id.toString());
      const clientInvoices = invoices.filter((inv) => inv.clientId?.toString() === c._id.toString());
      
      const clientRevenue = clientInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
      const activeCount = clientProjects.filter((p) => activeStatuses.includes(p.status)).length;
      
      return {
        clientId: c._id,
        name: c.name,
        company: c.company || "Independent",
        revenue: clientRevenue,
        activeProjectsCount: activeCount,
        relationshipHealth: c.rating && c.rating >= 4 ? "Good" : c.rating && c.rating >= 3 ? "Fair" : c.rating ? "At Risk" : "Good",
      };
    });
    clientIntelligenceList.sort((a, b) => b.revenue - a.revenue);
    const topClients = clientIntelligenceList.slice(0, 3);

    return NextResponse.json({
      stats: {
        totalClients,
        activeProjects,
        totalRevenue,
        pendingInvoices,
        actualPaidRevenue,
        pendingInvoicesSum,
        overdueInvoicesSum,
        overdueInvoicesCount,
      },
      proposalsStats: {
        total: totalProposals,
        won: wonProposalsCount,
        lost: lostProposalsCount,
        sent: sentProposalsCount,
        draft: draftProposalsCount,
        averageAiScore,
        conversionRate,
      },
      projectHealth: {
        totalActive: activeProjects,
        atRiskCount,
        onTrackCount: Math.max(0, activeProjects - atRiskCount),
      },
      upcomingDeadlines,
      topClients,
      chartData,
      activities,
      recentProjects,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load dashboard statistics";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
