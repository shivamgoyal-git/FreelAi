import mongoose, { Document, Model, Schema } from "mongoose";
import type { MessageAttachment } from "@/types/portal";

export interface IMessage extends Document {
  projectId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  userId: string; // Freelancer owner
  senderRole: "freelancer" | "client";
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  attachments: MessageAttachment[];
  readByClient: boolean;
  readByFreelancer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageAttachmentSchema = new Schema<MessageAttachment>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: String, default: "" },
    type: { type: String, default: "" },
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "projectId is required"],
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "clientId is required"],
      index: true,
    },
    userId: {
      type: String,
      required: [true, "userId is required"],
      index: true,
    },
    senderRole: {
      type: String,
      enum: ["freelancer", "client"],
      required: [true, "senderRole is required"],
    },
    senderId: {
      type: String,
      required: [true, "senderId is required"],
    },
    senderName: {
      type: String,
      required: [true, "senderName is required"],
      trim: true,
    },
    senderAvatar: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
    attachments: {
      type: [MessageAttachmentSchema],
      default: [],
    },
    readByClient: {
      type: Boolean,
      default: false,
    },
    readByFreelancer: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ projectId: 1, createdAt: 1 });
MessageSchema.index({ clientId: 1, readByClient: 1 });
MessageSchema.index({ userId: 1, readByFreelancer: 1 });

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
