import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import Activity, { ActivityType } from "@/models/Activity";
import type { NotificationType } from "@/types/portal";
import mongoose from "mongoose";

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
  type: NotificationType;
  link?: string;
  projectId?: string | mongoose.Types.ObjectId;
  invoiceId?: string | mongoose.Types.ObjectId;
}) {
  try {
    await connectDB();
    const notification = await Notification.create({
      recipientId,
      recipientRole,
      title,
      message,
      type,
      link,
      projectId: projectId ? new mongoose.Types.ObjectId(projectId.toString()) : undefined,
      invoiceId: invoiceId ? new mongoose.Types.ObjectId(invoiceId.toString()) : undefined,
    });
    return notification;
  } catch (error) {
    console.error("[sendNotification] Error creating notification:", error);
    return null;
  }
}

export async function recordActivity({
  userId,
  type,
  title,
  description,
  projectId,
  clientId,
  invoiceId,
  actorRole = "client",
}: {
  userId: string;
  type: ActivityType;
  title: string;
  description: string;
  projectId?: string | mongoose.Types.ObjectId;
  clientId?: string | mongoose.Types.ObjectId;
  invoiceId?: string | mongoose.Types.ObjectId;
  actorRole?: "freelancer" | "client";
}) {
  try {
    await connectDB();
    const activity = await Activity.create({
      userId,
      type,
      title,
      description,
      projectId: projectId ? new mongoose.Types.ObjectId(projectId.toString()) : undefined,
      clientId: clientId ? new mongoose.Types.ObjectId(clientId.toString()) : undefined,
      invoiceId: invoiceId ? new mongoose.Types.ObjectId(invoiceId.toString()) : undefined,
      actorRole,
    });
    return activity;
  } catch (error) {
    console.error("[recordActivity] Error recording activity:", error);
    return null;
  }
}
