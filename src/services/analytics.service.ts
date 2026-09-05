import { prisma } from "@/lib/prisma";

export class AnalyticsService {
  static async getDashboardOverview(userId: string) {
    const [clients, projects, invoices, activities] = await Promise.all([
      prisma.client.findMany({ where: { userId } }),
      prisma.project.findMany({ where: { userId } }),
      prisma.invoice.findMany({ where: { userId } }),
      prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const activeClients = clients.filter((c) => c.status === "active").length;
    const activeProjects = projects.filter((p) => p.status === "active").length;
    const completedProjects = projects.filter((p) => p.status === "completed").length;

    let totalRevenue = 0;
    let pendingRevenue = 0;
    let overdueRevenue = 0;

    for (const inv of invoices) {
      if (inv.status === "paid") {
        totalRevenue += inv.total;
      } else if (inv.status === "sent" || inv.status === "partially_paid") {
        pendingRevenue += inv.remainingAmount;
      } else if (inv.status === "overdue") {
        overdueRevenue += inv.remainingAmount;
      }
    }

    return {
      stats: {
        totalClients: clients.length,
        activeClients,
        totalProjects: projects.length,
        activeProjects,
        completedProjects,
        totalRevenue,
        pendingRevenue,
        overdueRevenue,
      },
      recentActivities: activities.map((a) => ({ ...a, _id: a.id })),
    };
  }
}
