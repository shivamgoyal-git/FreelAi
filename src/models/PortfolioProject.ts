import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPortfolioProject extends Document {
  userId: string;
  title: string;
  description: string;
  skills: string[];
  link: string;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioProjectSchema = new Schema<IPortfolioProject>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    skills: { type: [String], default: [] },
    link: { type: String, required: true },
  },
  { timestamps: true }
);

const PortfolioProject: Model<IPortfolioProject> =
  mongoose.models.PortfolioProject ||
  mongoose.model<IPortfolioProject>("PortfolioProject", PortfolioProjectSchema);

export default PortfolioProject;
