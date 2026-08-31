import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import Message from "@/models/Message";
import Client from "@/models/Client";
import mongoose from "mongoose";
import { sendNotification, recordActivity } from "@/lib/portal-notifications";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    await connectDB();

    const project = await Project.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const messages = await Message.find({ projectId: id })
      .sort({ createdAt: 1 })
      .lean();

    // Mark client messages as read by freelancer
    await Message.updateMany(
      { projectId: id, senderRole: "client", readByFreelancer: false },
      { $set: { readByFreelancer: true } }
    );

    return NextResponse.json({ messages });
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
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const body = await req.json();
    const { content, attachments = [] } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Message content cannot be empty" },
        { status: 400 }
      );
    }

    await connectDB();

    const project = await Project.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    let clientId: any = project.clientId;
    if (!clientId && project.clientName) {
      const matchedClient = await Client.findOne({
        userId: session.user.id,
        name: project.clientName,
      });
      if (matchedClient) clientId = matchedClient._id;
    }

    if (!clientId) {
      // Find any client for this user as fallback or require client
      const fallbackClient = await Client.findOne({ userId: session.user.id });
      if (fallbackClient) clientId = fallbackClient._id;
    }

    const message = await Message.create({
      projectId: new mongoose.Types.ObjectId(id),
      clientId: clientId ? new mongoose.Types.ObjectId(clientId.toString()) : undefined,
      userId: session.user.id,
      senderRole: "freelancer",
      senderId: session.user.id,
      senderName: session.user.name || "Freelancer",
      senderAvatar: session.user.image || "",
      content: content.trim(),
      attachments,
      readByFreelancer: true,
      readByClient: false,
    });

    if (clientId) {
      await sendNotification({
        recipientId: clientId.toString(),
        recipientRole: "client",
        title: "New Message from Freelancer",
        message: `${session.user.name || "Freelancer"}: "${content.trim().slice(0, 80)}${content.length > 80 ? "..." : ""}"`,
        type: "new_message",
        link: `/portal/projects/${id}?tab=messages`,
        projectId: id,
        clientId: clientId.toString(),
      });

      await recordActivity({
        userId: session.user.id,
        type: "message_sent",
        title: "Freelancer Sent Message",
        description: `Sent message to client for project "${project.title}".`,
        projectId: id,
        clientId: clientId.toString(),
        actorRole: "freelancer",
      });
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/projects/[id]/messages] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}
