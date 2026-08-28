import { NextRequest, NextResponse } from "next/server";
import { getClientSession, requireClientProject } from "@/lib/portal-auth";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import { sendNotification, recordActivity } from "@/lib/portal-notifications";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const previewClientId = searchParams.get("previewClientId");
    const projectId = searchParams.get("projectId");

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, role } = authCtx;
    await connectDB();

    const filter: Record<string, unknown> = { clientId };
    if (projectId) {
      filter.projectId = projectId;
    }

    const messages = await Message.find(filter)
      .populate("projectId", "title")
      .sort({ createdAt: 1 })
      .lean();

    // If client is reading, mark unread freelancer messages as read
    if (role === "client" && projectId) {
      await Message.updateMany(
        { projectId, senderRole: "freelancer", readByClient: false },
        { $set: { readByClient: true } }
      );
    }

    return NextResponse.json({ messages });
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

    if (!projectId || !content || !content.trim()) {
      return NextResponse.json(
        { error: "projectId and content are required" },
        { status: 400 }
      );
    }

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, client, userId, role } = authCtx;
    await connectDB();

    // Verify project belongs to this client
    const project = await requireClientProject(clientId, projectId);

    const message = await Message.create({
      projectId,
      clientId,
      userId: project.userId,
      senderRole: role === "freelancer" ? "freelancer" : "client",
      senderId: userId,
      senderName: client.name,
      senderAvatar: client.avatar || "",
      content: content.trim(),
      attachments,
      readByClient: role === "client",
      readByFreelancer: role === "freelancer",
    });

    // If sent by client, notify freelancer
    if (role === "client") {
      await sendNotification({
        recipientId: project.userId,
        recipientRole: "freelancer",
        title: "New Client Message",
        message: `${client.name}: "${content.trim().slice(0, 80)}${content.length > 80 ? "..." : ""}"`,
        type: "new_message",
        link: `/dashboard/projects/${projectId}?tab=messages`,
        projectId,
      });

      await recordActivity({
        userId: project.userId,
        type: "message_sent",
        title: "Client Sent Message",
        description: `${client.name} sent a message regarding "${project.title}".`,
        projectId,
        clientId,
        actorRole: "client",
      });
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/portal/messages] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: error.status || 500 }
    );
  }
}
