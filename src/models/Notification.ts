import mongoose, { Document, Model, Schema } from "mongoose";
import type { NotificationType } from "@/types/portal";

export interface INotification extends Document {
  recipientId: string; // User ID or Client ID string
  recipientRole: "freelancer" | "client";
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  read: boolean;
  projectId?: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: String,
      required: [true, "recipientId is required"],
      index: true,
    },
    recipientRole: {
      type: String,
      enum: ["freelancer", "client"],
      required: [true, "recipientRole is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "deliverable_uploaded",
        "deliverable_approved",
        "changes_requested",
        "invoice_sent",
        "invoice_due",
        "invoice_overdue",
        "invoice_paid",
        "new_message",
        "proposal_received",
        "proposal_accepted",
        "milestone_completed",
        "client_invited",
        "client_joined",
        "general",
      ],
      default: "general",
    },
    link: {
      type: String,
      default: "",
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

NotificationSchema.index({ recipientId: 1, recipientRole: 1, read: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
