import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNotification, recordActivity } from "@/lib/portal-notifications";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    const projectId = searchParams.get("projectId");

    // ── CASE A: Fetch conversation messages with a specific client ──
    if (clientId) {
      const client = await prisma.client.findFirst({
        where: { id: clientId, userId: session.user.id },
      });

      if (!client) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 });
      }

      const projects = await prisma.project.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { clientId: client.id },
            { clientName: client.name },
          ],
        },
      });

      const projectIds = projects.map((p) => p.id);

      const where: any = {
        OR: [
          { clientId: client.id },
          { projectId: { in: projectIds } },
        ],
      };

      if (projectId) {
        where.projectId = projectId;
      }

      const messages = await prisma.message.findMany({
        where,
        orderBy: { createdAt: "asc" },
      });

      // Mark unread client messages as read
      await prisma.message.updateMany({
        where: {
          OR: [
            { clientId: client.id },
            { projectId: { in: projectIds } },
          ],
          senderRole: "client",
          readByFreelancer: false,
        },
        data: { readByFreelancer: true },
      });

      return NextResponse.json({
        client: {
          _id: client.id,
          name: client.name,
          email: client.email,
          company: client.company || "",
          avatar: client.avatar || "",
          status: client.status,
        },
        projects: projects.map((p) => ({
          _id: p.id,
          title: p.title,
          status: p.status,
        })),
        messages: messages.map((m) => ({
          ...m,
          _id: m.id,
          attachments: Array.isArray(m.attachments) ? m.attachments : [],
        })),
      });
    }

    // ── CASE B: Fetch list of all client conversations (sidebar list) ──
    const [clients, projects, allMessages] = await Promise.all([
      prisma.client.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.project.findMany({ where: { userId: session.user.id } }),
      prisma.message.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const conversations = clients.map((client) => {
      const clientProjectIds = projects
        .filter(
          (p) =>
            p.clientId === client.id ||
            p.clientName?.toLowerCase().trim() === client.name.toLowerCase().trim()
        )
        .map((p) => p.id);

      const clientMessages = allMessages.filter(
        (m) =>
          m.clientId === client.id ||
          (m.projectId && clientProjectIds.includes(m.projectId))
      );

      const lastMessage = clientMessages[0] || null;
      const unreadCount = clientMessages.filter(
        (m) => m.senderRole === "client" && !m.readByFreelancer
      ).length;

      return {
        client: {
          _id: client.id,
          name: client.name,
          email: client.email,
          company: client.company || "",
          avatar: client.avatar || "",
          status: client.status,
        },
        lastMessage: lastMessage
          ? {
              ...lastMessage,
              _id: lastMessage.id,
              attachments: Array.isArray(lastMessage.attachments) ? lastMessage.attachments : [],
            }
          : null,
        unreadCount,
        projectCount: clientProjectIds.length,
        lastActivity: lastMessage?.createdAt || client.updatedAt || client.createdAt,
      };
    });

    conversations.sort((a, b) => {
      const timeA = new Date(a.lastActivity).getTime();
      const timeB = new Date(b.lastActivity).getTime();
      return timeB - timeA;
    });

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error("[GET /api/dashboard/messages] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { clientId, projectId, content, attachments = [] } = body;

    if (!clientId || !content || !content.trim()) {
      return NextResponse.json(
        { error: "clientId and content are required" },
        { status: 400 }
      );
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, userId: session.user.id },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    let finalProjectId = projectId;
    if (!finalProjectId) {
      const proj = await prisma.project.findFirst({
        where: {
          userId: session.user.id,
          OR: [{ clientId: client.id }, { clientName: client.name }],
        },
        orderBy: { updatedAt: "desc" },
      });

      if (proj) finalProjectId = proj.id;
    }

    const message = await prisma.message.create({
      data: {
        projectId: finalProjectId || null,
        clientId: client.id,
        userId: session.user.id,
        senderRole: "freelancer",
        senderId: session.user.id,
        senderName: session.user.name || "Freelancer",
        senderAvatar: session.user.image || "",
        content: content.trim(),
        attachments,
        readByFreelancer: true,
        readByClient: false,
      },
    });

    await sendNotification({
      recipientId: client.id,
      recipientRole: "client",
      title: "New Message from Freelancer",
      message: `${session.user.name || "Freelancer"}: "${content.trim().slice(0, 80)}${content.length > 80 ? "..." : ""}"`,
      type: "new_message",
      link: finalProjectId ? `/portal/projects/${finalProjectId}?tab=messages` : `/portal/messages`,
      projectId: finalProjectId || undefined,
      clientId: client.id,
    });

    await recordActivity({
      userId: session.user.id,
      type: "message_sent",
      title: "Sent Message to Client",
      description: `Sent direct message to ${client.name}.`,
      clientId: client.id,
      actorRole: "freelancer",
    });

    return NextResponse.json({
      success: true,
      message: {
        ...message,
        _id: message.id,
        attachments: Array.isArray(message.attachments) ? message.attachments : [],
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/dashboard/messages] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}
