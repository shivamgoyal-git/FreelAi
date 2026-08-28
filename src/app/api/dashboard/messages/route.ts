import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Message from "@/models/Message";
import mongoose from "mongoose";
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

    await connectDB();

    // ── CASE A: Fetch conversation messages with a specific client ──
    if (clientId) {
      if (!mongoose.Types.ObjectId.isValid(clientId)) {
        return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
      }

      const client = await Client.findOne({
        _id: clientId,
        userId: session.user.id,
      }).lean();

      if (!client) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 });
      }

      // Find projects for this client
      const projects = await Project.find({
        userId: session.user.id,
        $or: [
          { clientId: client._id },
          { clientName: client.name },
        ],
      }).lean();

      const projectIds = projects.map((p) => p._id);

      const messageFilter: any = {
        $or: [
          { clientId: client._id },
          { projectId: { $in: projectIds } },
        ],
      };

      if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
        messageFilter.projectId = projectId;
      }

      const messages = await Message.find(messageFilter)
        .sort({ createdAt: 1 })
        .lean();

      // Mark unread client messages as read
      await Message.updateMany(
        {
          $or: [
            { clientId: client._id },
            { projectId: { $in: projectIds } },
          ],
          senderRole: "client",
          readByFreelancer: false,
        },
        { $set: { readByFreelancer: true } }
      );

      return NextResponse.json({
        client: {
          _id: client._id.toString(),
          name: client.name,
          email: client.email,
          company: client.company || "",
          avatar: client.avatar || "",
          status: client.status,
        },
        projects: projects.map((p) => ({
          _id: p._id.toString(),
          title: p.title,
          status: p.status,
        })),
        messages,
      });
    }

    // ── CASE B: Fetch list of all client conversations (WhatsApp sidebar list) ──
    const clients = await Client.find({ userId: session.user.id })
      .sort({ updatedAt: -1 })
      .lean();

    const projects = await Project.find({ userId: session.user.id }).lean();
    const allMessages = await Message.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const conversations = clients.map((client) => {
      const clientProjectIds = projects
        .filter(
          (p) =>
            p.clientId?.toString() === client._id.toString() ||
            p.clientName?.toLowerCase().trim() === client.name.toLowerCase().trim()
        )
        .map((p) => p._id.toString());

      const clientMessages = allMessages.filter(
        (m) =>
          m.clientId?.toString() === client._id.toString() ||
          (m.projectId && clientProjectIds.includes(m.projectId.toString()))
      );

      const lastMessage = clientMessages[0] || null;
      const unreadCount = clientMessages.filter(
        (m) => m.senderRole === "client" && !m.readByFreelancer
      ).length;

      return {
        client: {
          _id: client._id.toString(),
          name: client.name,
          email: client.email,
          company: client.company || "",
          avatar: client.avatar || "",
          status: client.status,
        },
        lastMessage,
        unreadCount,
        projectCount: clientProjectIds.length,
        lastActivity: lastMessage?.createdAt || client.updatedAt || client.createdAt,
      };
    });

    // Sort conversations: clients with recent messages first, then newest clients
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

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    await connectDB();

    const client = await Client.findOne({
      _id: clientId,
      userId: session.user.id,
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    let finalProjectId = projectId;
    if (!finalProjectId) {
      // Find the first active project for this client if exists
      const proj = await Project.findOne({
        userId: session.user.id,
        $or: [{ clientId: client._id }, { clientName: client.name }],
      }).sort({ updatedAt: -1 });

      if (proj) finalProjectId = proj._id;
    }

    const message = await Message.create({
      projectId: finalProjectId || null,
      clientId: client._id,
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

    // Notify the client in client portal
    await sendNotification({
      recipientId: client._id.toString(),
      recipientRole: "client",
      title: "New Message from Freelancer",
      message: `${session.user.name || "Freelancer"}: "${content.trim().slice(0, 80)}${content.length > 80 ? "..." : ""}"`,
      type: "new_message",
      link: finalProjectId ? `/portal/projects/${finalProjectId}?tab=messages` : `/portal/messages`,
      projectId: finalProjectId ? finalProjectId.toString() : undefined,
      clientId: client._id.toString(),
    });

    await recordActivity({
      userId: session.user.id,
      type: "message_sent",
      title: "Sent Message to Client",
      description: `Sent direct message to ${client.name}.`,
      clientId: client._id,
      actorRole: "freelancer",
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/dashboard/messages] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}
