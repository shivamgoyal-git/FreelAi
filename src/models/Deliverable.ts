import mongoose, { Document, Model, Schema } from "mongoose";
import type { DeliverableStatus } from "@/types/portal";

export interface IDeliverable extends Document {
  projectId: mongoose.Types.ObjectId;
  milestoneId?: string;
  clientId: mongoose.Types.ObjectId;
  userId: string; // Freelancer owner
  title: string;
  version: string;
  description: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  externalUrl?: string;
  status: DeliverableStatus;
  clientFeedback?: string;
  feedbackDate?: Date;
  approvedDate?: Date;
  uploadedBy: "freelancer" | "client";
  createdAt: Date;
  updatedAt: Date;
}

const DeliverableSchema = new Schema<IDeliverable>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "projectId is required"],
      index: true,
    },
    milestoneId: {
      type: String,
      default: "",
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
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    version: {
      type: String,
      default: "v1",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    fileUrl: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      default: "",
    },
    fileSize: {
      type: String,
      default: "",
    },
    fileType: {
      type: String,
      default: "",
    },
    externalUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending_review", "changes_requested", "approved"],
      default: "pending_review",
      index: true,
    },
    clientFeedback: {
      type: String,
      default: "",
    },
    feedbackDate: {
      type: Date,
      default: null,
    },
    approvedDate: {
      type: Date,
      default: null,
    },
    uploadedBy: {
      type: String,
      enum: ["freelancer", "client"],
      default: "freelancer",
    },
  },
  {
    timestamps: true,
  }
);

DeliverableSchema.index({ projectId: 1, createdAt: -1 });
DeliverableSchema.index({ clientId: 1, status: 1 });

const Deliverable: Model<IDeliverable> =
  mongoose.models.Deliverable ||
  mongoose.model<IDeliverable>("Deliverable", DeliverableSchema);

export default Deliverable;
