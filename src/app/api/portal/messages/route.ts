import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import Project from "@/models/Project";
import Client from "@/models/Client";
import mongoose from "mongoose";
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

    await connectDB();

    let filter: any = {};

    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      const project = await Project.findById(projectId).lean();
      const projObjId = new mongoose.Types.ObjectId(projectId);

      const conditions: any[] = [
        { projectId: projObjId },
        { projectId: projectId },
      ];

      if (project?.clientId) {
        conditions.push(
          { clientId: project.clientId },
          { clientId: project.clientId.toString() }
        );
      }

      filter = { $or: conditions };
    } else {
      const cId = authCtx.clientId;
      const conditions: any[] = [{ clientId: cId }];
      if (mongoose.Types.ObjectId.isValid(cId)) {
        conditions.push({ clientId: new mongoose.Types.ObjectId(cId) });
      }
      filter = { $or: conditions };
    }

    const messages = await Message.find(filter)
      .sort({ createdAt: 1 })
      .lean();

    // Mark unread freelancer messages as read if client is viewing
    if (authCtx.role === "client" || authCtx.isPreview) {
      await Message.updateMany(
        { ...filter, senderRole: "freelancer", readByClient: false },
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

    await connectDB();

    let targetClientId: any = authCtx.clientId;
    let targetUserId = authCtx.client?.userId || authCtx.userId;
    let clientName = authCtx.client?.name || "Client";
    let clientAvatar = authCtx.client?.avatar || "";
    let finalProjId: any = null;

    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      const project = await Project.findById(projectId).lean();
      if (project) {
        finalProjId = project._id;
        if (project.clientId) targetClientId = project.clientId;
        if (project.userId) targetUserId = project.userId;
      }
    }

    if (targetClientId && mongoose.Types.ObjectId.isValid(targetClientId)) {
      const clientDoc = await Client.findById(targetClientId).lean();
      if (clientDoc) {
        clientName = clientDoc.name || clientName;
        clientAvatar = clientDoc.avatar || clientAvatar;
        if (clientDoc.userId) targetUserId = clientDoc.userId;
      }
    }

    const message = await Message.create({
      projectId: finalProjId,
      clientId: targetClientId,
      userId: targetUserId ? targetUserId.toString() : "",
      senderRole: "client",
      senderId: authCtx.userId,
      senderName: clientName,
      senderAvatar: clientAvatar,
      content: content.trim(),
      attachments,
      readByClient: true,
      readByFreelancer: false,
    });

    if (targetUserId) {
      await sendNotification({
        recipientId: targetUserId.toString(),
        recipientRole: "freelancer",
        title: "New Client Message",
        message: `${clientName}: "${content.trim().slice(0, 80)}${content.length > 80 ? "..." : ""}"`,
        type: "new_message",
        link: `/dashboard/messages?clientId=${targetClientId}`,
        projectId: finalProjId ? finalProjId.toString() : undefined,
        clientId: targetClientId ? targetClientId.toString() : undefined,
      });

      await recordActivity({
        userId: targetUserId.toString(),
        type: "message_sent",
        title: "Client Sent Message",
        description: `${clientName} sent a message.`,
        projectId: finalProjId ? finalProjId.toString() : undefined,
        clientId: targetClientId,
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
