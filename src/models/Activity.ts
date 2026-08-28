import mongoose, { Document, Model, Schema } from "mongoose";

export type ActivityType =
  | "client_added"
  | "proposal_generated"
  | "invoice_created"
  | "invoice_sent"
  | "invoice_partially_paid"
  | "invoice_paid"
  | "invoice_overdue"
  | "invoice_cancelled"
  | "project_created"
  | "project_updated"
  | "antigravity_prompt"
  | "deliverable_uploaded"
  | "deliverable_approved"
  | "changes_requested"
  | "message_sent"
  | "proposal_accepted"
  | "client_invited"
  | "client_joined"
  | "milestone_completed"
  | "file_uploaded";

export interface IActivity extends Document {
  userId: string;
  type: ActivityType;
  title: string;
  description: string;
  invoiceId?: mongoose.Types.ObjectId | string;
  projectId?: mongoose.Types.ObjectId | string;
  clientId?: mongoose.Types.ObjectId | string;
  actorRole?: "freelancer" | "client";
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    userId: {
      type: String,
      required: [true, "userId is required"],
      index: true,
    },
    type: {
      type: String,
      enum: [
        "client_added",
        "proposal_generated",
        "invoice_created",
        "invoice_sent",
        "invoice_partially_paid",
        "invoice_paid",
        "invoice_overdue",
        "invoice_cancelled",
        "project_created",
        "project_updated",
        "antigravity_prompt",
        "deliverable_uploaded",
        "deliverable_approved",
        "changes_requested",
        "message_sent",
        "proposal_accepted",
        "client_invited",
        "client_joined",
        "milestone_completed",
        "file_uploaded",
      ],
      required: [true, "Activity type is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      default: null,
      index: true,
    },
    actorRole: {
      type: String,
      enum: ["freelancer", "client"],
      default: "freelancer",
    },
  },
  {
    // Enable automated createdAt timestamp, disable updatedAt
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexing for faster retrieves of user's activities sorted by time
ActivitySchema.index({ userId: 1, createdAt: -1 });
ActivitySchema.index({ clientId: 1, createdAt: -1 });
ActivitySchema.index({ projectId: 1, createdAt: -1 });

const Activity: Model<IActivity> =
  mongoose.models.Activity ||
  mongoose.model<IActivity>("Activity", ActivitySchema);

export default Activity;
