import mongoose, { Document, Model, Schema } from "mongoose";
import type {
  ProjectStatus,
  ProjectPriority,
  ProjectCategory,
} from "@/types/project";

export interface IMilestone {
  id: string;
  title: string;
  dueDate?: string;
  completed: boolean;
}

export interface IProject extends Document {
  userId: string;
  title: string;
  description: string;
  clientId?: string;
  clientName?: string;
  category: ProjectCategory;
  status: ProjectStatus;
  priority: ProjectPriority;
  budget: number;
  currency: string;
  paid: number;
  progress: number;
  startDate?: string;
  dueDate?: string;
  tags: string[];
  milestones: IMilestone[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    dueDate: { type: String, default: "" },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
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
    description: { type: String, default: "" },
    clientId: { type: String, default: null },
    clientName: { type: String, default: "" },
    category: {
      type: String,
      enum: ["design","development","illustration","video","writing","marketing","consulting","other"],
      default: "design",
    },
    status: {
      type: String,
      enum: ["draft","active","in_review","completed","on_hold","cancelled"],
      default: "draft",
    },
    priority: {
      type: String,
      enum: ["low","medium","high","urgent"],
      default: "medium",
    },
    budget: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "USD" },
    paid: { type: Number, default: 0, min: 0 },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    startDate: { type: String, default: "" },
    dueDate: { type: String, default: "" },
    tags: { type: [String], default: [] },
    milestones: { type: [MilestoneSchema], default: [] },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

ProjectSchema.index({ userId: 1, status: 1 });
ProjectSchema.index({ userId: 1, title: 1 });

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
