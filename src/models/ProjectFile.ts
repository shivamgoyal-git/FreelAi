import mongoose, { Document, Model, Schema } from "mongoose";
import type { FileCategory } from "@/types/portal";

export interface IProjectFile extends Document {
  projectId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  userId: string; // Freelancer owner
  name: string;
  url: string;
  size: string;
  fileType: string;
  uploadedBy: "freelancer" | "client";
  uploaderName: string;
  category: FileCategory;
  isClientVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectFileSchema = new Schema<IProjectFile>(
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
    name: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },
    url: {
      type: String,
      required: [true, "File URL is required"],
      trim: true,
    },
    size: {
      type: String,
      default: "0 KB",
    },
    fileType: {
      type: String,
      default: "document",
    },
    uploadedBy: {
      type: String,
      enum: ["freelancer", "client"],
      default: "freelancer",
    },
    uploaderName: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["deliverable", "contract", "guidelines", "invoice", "asset", "other"],
      default: "asset",
    },
    isClientVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ProjectFileSchema.index({ clientId: 1, isClientVisible: 1, createdAt: -1 });
ProjectFileSchema.index({ projectId: 1, isClientVisible: 1, createdAt: -1 });

const ProjectFile: Model<IProjectFile> =
  mongoose.models.ProjectFile ||
  mongoose.model<IProjectFile>("ProjectFile", ProjectFileSchema);

export default ProjectFile;
