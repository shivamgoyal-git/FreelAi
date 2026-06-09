import mongoose, { Document, Model, Schema } from "mongoose";

export type ClientStatus = "active" | "inactive" | "prospect" | "archived";

export interface IClient extends Document {
  userId: string; // owner (freelancer)
  name: string;
  email: string;
  phone?: string;
  company?: string;
  website?: string;
  location?: string;
  avatar?: string; // URL or null
  status: ClientStatus;
  tags: string[];
  notes?: string;
  totalProjects: number;
  totalEarned: number;
  rating?: number; // 1-5
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    userId: {
      type: String,
      required: [true, "userId is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: { type: String, trim: true, default: "" },
    company: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    avatar: { type: String, default: null },
    status: {
      type: String,
      enum: ["active", "inactive", "prospect", "archived"],
      default: "active",
    },
    tags: { type: [String], default: [] },
    notes: { type: String, default: "" },
    totalProjects: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    rating: { type: Number, min: 1, max: 5, default: null },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast user-scoped searches
ClientSchema.index({ userId: 1, name: 1 });
ClientSchema.index({ userId: 1, email: 1 });

const Client: Model<IClient> =
  mongoose.models.Client ||
  mongoose.model<IClient>("Client", ClientSchema);

export default Client;
