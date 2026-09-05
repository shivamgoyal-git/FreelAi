import { prisma } from "@/lib/prisma";
import type { ClientStatus } from "@prisma/client";

export class ClientsService {
  static async getClientsByUserId(userId: string) {
    const clients = await prisma.client.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return clients.map((c) => ({
      ...c,
      _id: c.id,
    }));
  }

  static async getClientById(id: string, userId: string) {
    const client = await prisma.client.findFirst({
      where: { id, userId },
    });
    if (!client) return null;
    return {
      ...client,
      _id: client.id,
    };
  }

  static async createClient(userId: string, data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    website?: string;
    location?: string;
    avatar?: string;
    status?: ClientStatus;
    tags?: string[];
    notes?: string;
  }) {
    const ws = await prisma.workspace.findFirst({ where: { ownerId: userId } });
    const client = await prisma.client.create({
      data: {
        userId,
        workspaceId: ws?.id,
        name: data.name,
        email: data.email.toLowerCase().trim(),
        phone: data.phone || "",
        company: data.company || "",
        website: data.website || "",
        location: data.location || "",
        avatar: data.avatar || null,
        status: data.status || "active",
        tags: data.tags || [],
        notes: data.notes || "",
      },
    });
    return {
      ...client,
      _id: client.id,
    };
  }

  static async updateClient(id: string, userId: string, data: any) {
    const client = await prisma.client.updateMany({
      where: { id, userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email.toLowerCase().trim() }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.company !== undefined && { company: data.company }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
        ...(data.status && { status: data.status }),
        ...(data.tags && { tags: data.tags }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.totalProjects !== undefined && { totalProjects: Number(data.totalProjects) }),
        ...(data.totalEarned !== undefined && { totalEarned: Number(data.totalEarned) }),
        ...(data.rating !== undefined && { rating: data.rating }),
      },
    });

    if (client.count === 0) return null;
    return this.getClientById(id, userId);
  }

  static async deleteClient(id: string, userId: string) {
    const result = await prisma.client.deleteMany({
      where: { id, userId },
    });
    return result.count > 0;
  }
}
