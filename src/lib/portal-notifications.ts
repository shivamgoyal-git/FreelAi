import { prisma } from "@/lib/prisma";
import type { NotificationType, ActivityType } from "@prisma/client";

export async function sendNotification({
  recipientId,
  recipientRole,
  title,
  message,
  type,
  link = "",
  projectId,
  invoiceId,
}: {
  recipientId: string;
  recipientRole: "freelancer" | "client";
  title: string;
  message: string;
  type: string;
  link?: string;
  projectId?: string;
  invoiceId?: string;
  clientId?: string;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        recipientId,
        recipientRole,
        title,
        message,
        type: type as NotificationType,
        link,
        projectId: projectId ? projectId.toString() : null,
        invoiceId: invoiceId ? invoiceId.toString() : null,
      },
    });
    return {
      ...notification,
      _id: notification.id,
    };
  } catch (error) {
    console.error("[sendNotification] Error creating notification:", error);
    return null;
  }
}

export async function recordActivity({
  userId,
  type,
  title,
  description = "",
  projectId,
  clientId,
  invoiceId,
  actorRole = "client",
}: {
  userId: string;
  type: string;
  title: string;
  description?: string;
  projectId?: string;
  clientId?: string;
  invoiceId?: string;
  actorRole?: "freelancer" | "client";
}) {
  try {
    const activity = await prisma.activity.create({
      data: {
        userId,
        type: type as ActivityType,
        title,
        description,
        projectId: projectId ? projectId.toString() : null,
        clientId: clientId ? clientId.toString() : null,
        invoiceId: invoiceId ? invoiceId.toString() : null,
        actorRole,
      },
    });
    return {
      ...activity,
      _id: activity.id,
    };
  } catch (error) {
    console.error("[recordActivity] Error recording activity:", error);
    return null;
  }
}
