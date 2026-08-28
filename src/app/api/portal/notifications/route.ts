import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const previewClientId = searchParams.get("previewClientId");

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, userId } = authCtx;
    await connectDB();

    const notifications = await Notification.find({
      $or: [{ recipientId: clientId }, { recipientId: userId }],
      recipientRole: "client",
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    console.error("[GET /api/portal/notifications] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch notifications" },
      { status: error.status || 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { notificationId, markAll = false, previewClientId } = body;

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, userId } = authCtx;
    await connectDB();

    if (markAll) {
      await Notification.updateMany(
        {
          $or: [{ recipientId: clientId }, { recipientId: userId }],
          recipientRole: "client",
          read: false,
        },
        { $set: { read: true } }
      );
      return NextResponse.json({ success: true, message: "All marked as read" });
    }

    if (notificationId) {
      await Notification.updateOne(
        {
          _id: notificationId,
          $or: [{ recipientId: clientId }, { recipientId: userId }],
        },
        { $set: { read: true } }
      );
      return NextResponse.json({ success: true, message: "Notification marked as read" });
    }

    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  } catch (error: any) {
    console.error("[PATCH /api/portal/notifications] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update notification" },
      { status: error.status || 500 }
    );
  }
}
