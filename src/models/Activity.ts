import mongoose, { Document, Model, Schema } from "mongoose";

export type ActivityType =
  | "client_added"
  | "proposal_generated"
  | "invoice_paid"
  | "antigravity_prompt";

export interface IActivity extends Document {
  userId: string;
  type: ActivityType;
  title: string;
  description: string;
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
      enum: ["client_added", "proposal_generated", "invoice_paid", "antigravity_prompt"],
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
  },
  {
    // Enable automated createdAt timestamp, disable updatedAt
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexing for faster retrieves of user's activities sorted by time
ActivitySchema.index({ userId: 1, createdAt: -1 });

const Activity: Model<IActivity> =
  mongoose.models.Activity ||
  mongoose.model<IActivity>("Activity", ActivitySchema);

export default Activity;
