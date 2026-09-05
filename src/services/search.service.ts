import { prisma } from "@/lib/prisma";

export class SearchService {
  static async searchAll(userId: string, query: string) {
    if (!query || query.trim().length === 0) {
      return { clients: [], projects: [], invoices: [], proposals: [] };
    }

    const q = query.trim();

    const [clients, projects, invoices, proposals] = await Promise.all([
      prisma.client.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { company: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
      prisma.project.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { clientName: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
      prisma.invoice.findMany({
        where: {
          userId,
          OR: [
            { invoiceNumber: { contains: q, mode: "insensitive" } },
          ],
        },
        include: { client: true },
        take: 10,
      }),
      prisma.proposal.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { clientName: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
    ]);

    return {
      clients: clients.map((c) => ({ ...c, _id: c.id })),
      projects: projects.map((p) => ({ ...p, _id: p.id })),
      invoices: invoices.map((i) => ({ ...i, _id: i.id })),
      proposals: proposals.map((pr) => ({ ...pr, _id: pr.id })),
    };
  }
}
