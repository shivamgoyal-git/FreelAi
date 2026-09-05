import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/prisma";
import { sendNotification, recordActivity } from "@/lib/portal-notifications";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const previewClientId = searchParams.get("previewClientId");
    const projectId = searchParams.get("projectId");

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let where: any = {};

    if (projectId) {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      const conditions: any[] = [{ projectId }];
      if (project?.clientId) {
        conditions.push({ clientId: project.clientId });
      }
      where = { OR: conditions };
    } else {
      where = { clientId: authCtx.clientId };
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    if (authCtx.role === "client" || authCtx.isPreview) {
      await prisma.message.updateMany({
        where: { ...where, senderRole: "freelancer", readByClient: false },
        data: { readByClient: true },
      });
    }

    return NextResponse.json({
      messages: messages.map((m) => ({
        ...m,
        _id: m.id,
        attachments: Array.isArray(m.attachments) ? m.attachments : [],
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/portal/messages] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch messages" },
      { status: error.status || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, content, attachments = [], previewClientId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let targetClientId: string = authCtx.clientId;
    let targetUserId = authCtx.client?.userId || authCtx.userId;
    let clientName = authCtx.client?.name || "Client";
    let clientAvatar = authCtx.client?.avatar || "";
    let finalProjId: string | null = null;

    if (projectId) {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (project) {
        finalProjId = project.id;
        if (project.clientId) targetClientId = project.clientId;
        if (project.userId) targetUserId = project.userId;
      }
    }

    if (targetClientId) {
      const clientDoc = await prisma.client.findUnique({ where: { id: targetClientId } });
      if (clientDoc) {
        clientName = clientDoc.name || clientName;
        clientAvatar = clientDoc.avatar || clientAvatar;
        if (clientDoc.userId) targetUserId = clientDoc.userId;
      }
    }

    const message = await prisma.message.create({
      data: {
        projectId: finalProjId,
        clientId: targetClientId,
        userId: targetUserId || "",
        senderRole: "client",
        senderId: authCtx.userId,
        senderName: clientName,
        senderAvatar: clientAvatar,
        content: content.trim(),
        attachments: Array.isArray(attachments) ? attachments : [],
        readByClient: true,
        readByFreelancer: false,
      },
    });

    if (targetUserId) {
      await sendNotification({
        recipientId: targetUserId,
        recipientRole: "freelancer",
        title: "New Client Message",
        message: `${clientName}: "${content.trim().slice(0, 80)}${content.length > 80 ? "..." : ""}"`,
        type: "new_message",
        link: `/dashboard/messages?clientId=${targetClientId}`,
        projectId: finalProjId || undefined,
        clientId: targetClientId,
      });

      await recordActivity({
        userId: targetUserId,
        type: "message_sent",
        title: "Client Sent Message",
        description: `${clientName} sent a message.`,
        projectId: finalProjId || undefined,
        clientId: targetClientId,
        actorRole: "client",
      });
    }

    return NextResponse.json({
      success: true,
      message: {
        ...message,
        _id: message.id,
        attachments: Array.isArray(message.attachments) ? message.attachments : [],
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/portal/messages] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: error.status || 500 }
    );
  }
}
