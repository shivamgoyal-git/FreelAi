import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNotification, recordActivity } from "@/lib/portal-notifications";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "asc" },
    });

    // Mark client messages as read by freelancer
    await prisma.message.updateMany({
      where: { projectId: id, senderRole: "client", readByFreelancer: false },
      data: { readByFreelancer: true },
    });

    return NextResponse.json({
      messages: messages.map((m) => ({
        ...m,
        _id: m.id,
        attachments: Array.isArray(m.attachments) ? m.attachments : [],
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/projects/[id]/messages] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { content, attachments = [] } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Message content cannot be empty" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    let clientId = project.clientId;
    if (!clientId && project.clientName) {
      const matchedClient = await prisma.client.findFirst({
        where: {
          userId: session.user.id,
          name: project.clientName,
        },
      });
      if (matchedClient) clientId = matchedClient.id;
    }

    if (!clientId) {
      const fallbackClient = await prisma.client.findFirst({ where: { userId: session.user.id } });
      if (fallbackClient) clientId = fallbackClient.id;
    }

    if (!clientId) {
      return NextResponse.json(
        { error: "Project must have a client to send messages" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        projectId: id,
        clientId,
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
      recipientId: clientId,
      recipientRole: "client",
      title: "New Message from Freelancer",
      message: `${session.user.name || "Freelancer"}: "${content.trim().slice(0, 80)}${content.length > 80 ? "..." : ""}"`,
      type: "new_message",
      link: `/portal/projects/${id}?tab=messages`,
      projectId: id,
      clientId,
    });

    await recordActivity({
      userId: session.user.id,
      type: "message_sent",
      title: "Freelancer Sent Message",
      description: `Sent message to client for project "${project.title}".`,
      projectId: id,
      clientId,
      actorRole: "freelancer",
    });

    return NextResponse.json(
      {
        success: true,
        message: {
          ...message,
          _id: message.id,
          attachments: Array.isArray(message.attachments) ? message.attachments : [],
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/projects/[id]/messages] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}
