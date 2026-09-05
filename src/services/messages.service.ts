import { prisma } from "@/lib/prisma";

export class MessagesService {
  static async getMessages(query: { clientId: string; projectId?: string }) {
    const where: any = { clientId: query.clientId };
    if (query.projectId) {
      where.projectId = query.projectId;
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    return messages.map((m) => ({
      ...m,
      _id: m.id,
      attachments: Array.isArray(m.attachments) ? m.attachments : [],
    }));
  }

  static async createMessage(data: {
    projectId?: string | null;
    clientId: string;
    userId?: string;
    senderRole: "freelancer" | "client";
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    content: string;
    attachments?: any[];
  }) {
    const message = await prisma.message.create({
      data: {
        projectId: data.projectId || null,
        clientId: data.clientId,
        userId: data.userId || "",
        senderRole: data.senderRole,
        senderId: data.senderId,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar || "",
        content: data.content,
        attachments: data.attachments || [],
        readByClient: data.senderRole === "client",
        readByFreelancer: data.senderRole === "freelancer",
      },
    });

    return {
      ...message,
      _id: message.id,
      attachments: Array.isArray(message.attachments) ? message.attachments : [],
    };
  }

  static async markMessagesAsRead(clientId: string, role: "freelancer" | "client") {
    if (role === "freelancer") {
      await prisma.message.updateMany({
        where: { clientId, readByFreelancer: false },
        data: { readByFreelancer: true },
      });
    } else {
      await prisma.message.updateMany({
        where: { clientId, readByClient: false },
        data: { readByClient: true },
      });
    }
  }
}
