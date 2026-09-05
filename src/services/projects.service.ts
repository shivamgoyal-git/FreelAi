import { prisma } from "@/lib/prisma";
import type { ProjectStatus, ProjectPriority, ProjectCategory } from "@prisma/client";

export class ProjectsService {
  static async getProjectsByUserId(userId: string, filters?: { status?: string; clientId?: string }) {
    const where: any = { userId };
    if (filters?.status && filters.status !== "all") {
      where.status = filters.status;
    }
    if (filters?.clientId) {
      where.clientId = filters.clientId;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        milestones: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return projects.map((p) => ({
      ...p,
      _id: p.id,
      milestones: p.milestones.map((m) => ({
        id: m.id,
        title: m.title,
        dueDate: m.dueDate,
        completed: m.completed,
      })),
    }));
  }

  static async getProjectById(id: string, userId?: string) {
    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }

    const project = await prisma.project.findFirst({
      where,
      include: {
        milestones: true,
        client: true,
      },
    });

    if (!project) return null;

    return {
      ...project,
      _id: project.id,
      milestones: project.milestones.map((m) => ({
        id: m.id,
        title: m.title,
        dueDate: m.dueDate,
        completed: m.completed,
      })),
    };
  }

  static async createProject(userId: string, data: {
    title: string;
    description?: string;
    clientId?: string;
    clientName?: string;
    category?: ProjectCategory;
    status?: ProjectStatus;
    priority?: ProjectPriority;
    budget?: number;
    currency?: string;
    startDate?: string;
    dueDate?: string;
    tags?: string[];
    notes?: string;
    milestones?: Array<{ title: string; dueDate?: string; completed?: boolean }>;
  }) {
    const ws = await prisma.workspace.findFirst({ where: { ownerId: userId } });
    let clientName = data.clientName || "";
    if (data.clientId && !clientName) {
      const client = await prisma.client.findUnique({ where: { id: data.clientId } });
      if (client) clientName = client.name;
    }

    const project = await prisma.project.create({
      data: {
        userId,
        workspaceId: ws?.id,
        title: data.title,
        description: data.description || "",
        clientId: data.clientId || null,
        clientName,
        category: data.category || "design",
        status: data.status || "draft",
        priority: data.priority || "medium",
        budget: Number(data.budget) || 0,
        currency: data.currency || "USD",
        startDate: data.startDate || "",
        dueDate: data.dueDate || "",
        tags: data.tags || [],
        notes: data.notes || "",
        milestones: {
          create: (data.milestones || []).map((m, idx) => ({
            id: `m-${Date.now()}-${idx}`,
            title: m.title,
            dueDate: m.dueDate || "",
            completed: !!m.completed,
          })),
        },
      },
      include: {
        milestones: true,
      },
    });

    return {
      ...project,
      _id: project.id,
      milestones: project.milestones.map((m) => ({
        id: m.id,
        title: m.title,
        dueDate: m.dueDate,
        completed: m.completed,
      })),
    };
  }

  static async updateProject(id: string, userId: string, data: any) {
    const existing = await prisma.project.findFirst({ where: { id, userId } });
    if (!existing) return null;

    if (Array.isArray(data.milestones)) {
      await prisma.milestone.deleteMany({ where: { projectId: id } });
      for (let i = 0; i < data.milestones.length; i++) {
        const m = data.milestones[i];
        await prisma.milestone.create({
          data: {
            id: m.id || `m-${id}-${i}`,
            projectId: id,
            title: m.title || "Milestone",
            dueDate: m.dueDate || "",
            completed: !!m.completed,
          },
        });
      }
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.clientId !== undefined && { clientId: data.clientId }),
        ...(data.clientName !== undefined && { clientName: data.clientName }),
        ...(data.category && { category: data.category }),
        ...(data.status && { status: data.status }),
        ...(data.priority && { priority: data.priority }),
        ...(data.budget !== undefined && { budget: Number(data.budget) }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.paid !== undefined && { paid: Number(data.paid) }),
        ...(data.progress !== undefined && { progress: Number(data.progress) }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
        ...(data.tags && { tags: data.tags }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        milestones: true,
      },
    });

    return {
      ...updated,
      _id: updated.id,
      milestones: updated.milestones.map((m) => ({
        id: m.id,
        title: m.title,
        dueDate: m.dueDate,
        completed: m.completed,
      })),
    };
  }

  static async deleteProject(id: string, userId: string) {
    const result = await prisma.project.deleteMany({
      where: { id, userId },
    });
    return result.count > 0;
  }
}
