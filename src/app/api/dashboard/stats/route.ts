import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Activity from "@/models/Activity";



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

    // 2. Fetch projects for metrics & chart
    const projects = await Project.find({ userId }).lean();

    const activeStatuses = ["active", "in_review", "on_hold"];
    const activeProjects = projects.filter((p) => activeStatuses.includes(p.status)).length;

    let totalRevenue = 0;
    let pendingInvoices = 0;

    projects.forEach((p) => {
      totalRevenue += p.paid || 0;
      if (p.budget > p.paid && p.status !== "cancelled") {
        pendingInvoices += (p.budget - p.paid);
      }
    });

    // 3. Generate chart data (group earnings by month)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = months.map((m) => ({ month: m, earnings: 0, projects: 0 }));

    // Determine current year (default 2026 based on system time)
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

    // Return actual calculated chart data
    const finalChartData = chartData;

    // 4. Fetch activities
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

      // Bulk write to DB and re-query
      await Activity.insertMany(seedActivities);
      activities = await Activity.find({ userId }).sort({ createdAt: -1 }).limit(10).lean();
    }

    // 5. Get recent 5 active projects to display on the dashboard table
    const recentProjects = projects
      .sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      })
      .slice(0, 5);

    return NextResponse.json({
      stats: {
        totalClients,
        activeProjects,
        totalRevenue,
        pendingInvoices,
      },
      chartData: finalChartData,
      activities,
      recentProjects,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load dashboard statistics";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
