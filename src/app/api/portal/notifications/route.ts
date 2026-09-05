import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const previewClientId = searchParams.get("previewClientId");

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, userId } = authCtx;

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ recipientId: clientId }, { recipientId: userId }],
        recipientRole: "client",
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({
      notifications: notifications.map((n) => ({ ...n, _id: n.id })),
      unreadCount,
    });
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

    if (markAll) {
      await prisma.notification.updateMany({
        where: {
          OR: [{ recipientId: clientId }, { recipientId: userId }],
          recipientRole: "client",
          read: false,
        },
        data: { read: true },
      });
      return NextResponse.json({ success: true, message: "All marked as read" });
    }

    if (notificationId) {
      await prisma.notification.updateMany({
        where: {
          id: notificationId,
          OR: [{ recipientId: clientId }, { recipientId: userId }],
        },
        data: { read: true },
      });
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
