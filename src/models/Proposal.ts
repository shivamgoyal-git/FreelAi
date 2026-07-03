import mongoose, { Document, Model, Schema } from "mongoose";

export type ProposalStatus = "draft" | "sent" | "won" | "lost";
export type FreelancePlatform = "Upwork" | "Freelancer" | "Fiverr" | "LinkedIn" | "Direct" | "Other";

export interface IProposalSection {
  executiveSummary: string;
  scopeOfWork: string;
  timelineAndMilestones: string;
  callToAction: string;
}

export interface IPricingTier {
  price: number;
  description: string;
  timeline: string;
}

export interface IPpricingBreakdown {
  basic: IPricingTier;
  standard: IPricingTier;
  premium: IPricingTier;
}

export interface IAiAnalysis {
  readability: string;
  personalization: number;
  professionalism: number;
  confidence: number;
  urgency: string;
  budgetSensitivity: string;
  complexity: string;
  communicationStyle: string;
}

export interface IScoreBreakdown {
  overall: number;
  clarity: number;
  alignment: number;
  callToAction: number;
  valueProposition: number;
}

export interface IProposalVersion {
  versionNumber: number;
  sections: IProposalSection;
  pricingBreakdown: IPpricingBreakdown;
  aiAnalysis: IAiAnalysis;
  scoreBreakdown: IScoreBreakdown;
  detectedPainPoints: string[];
  aiSuggestions: string[];
  promptVersion: string;
  createdAt: Date;
}

export interface IProposal extends Document {
  userId: string;
  title: string;
  clientId?: mongoose.Types.ObjectId | string | null;
  status: ProposalStatus;
  value: number; // Keep for backward compat with analytics (corresponds to budget)
  currency: string;
  isFavorite: boolean;
  clientName: string;
  platform: FreelancePlatform;
  jobPost: string;
  portfolios: string[];
  budget: number;
  timeline: string;
  tone: string;
  templateId?: string;
  activeVersionIndex: number;
  versions: IProposalVersion[];
  createdAt: Date;
  updatedAt: Date;
}

const ProposalSectionSchema = new Schema<IProposalSection>({
  executiveSummary: { type: String, required: true },
  scopeOfWork: { type: String, required: true },
  timelineAndMilestones: { type: String, required: true },
  callToAction: { type: String, required: true },
}, { _id: false });

const PricingTierSchema = new Schema<IPricingTier>({
  price: { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
  timeline: { type: String, required: true },
}, { _id: false });

const PricingBreakdownSchema = new Schema<IPpricingBreakdown>({
  basic: { type: PricingTierSchema, required: true },
  standard: { type: PricingTierSchema, required: true },
  premium: { type: PricingTierSchema, required: true },
}, { _id: false });

const AiAnalysisSchema = new Schema<IAiAnalysis>({
  readability: { type: String, required: true },
  personalization: { type: Number, required: true, min: 0, max: 100 },
  professionalism: { type: Number, required: true, min: 0, max: 100 },
  confidence: { type: Number, required: true, min: 0, max: 100 },
  urgency: { type: String, required: true },
  budgetSensitivity: { type: String, required: true },
  complexity: { type: String, required: true },
  communicationStyle: { type: String, required: true },
}, { _id: false });

const ScoreBreakdownSchema = new Schema<IScoreBreakdown>({
  overall: { type: Number, required: true, min: 0, max: 100 },
  clarity: { type: Number, required: true, min: 0, max: 100 },
  alignment: { type: Number, required: true, min: 0, max: 100 },
  callToAction: { type: Number, required: true, min: 0, max: 100 },
  valueProposition: { type: Number, required: true, min: 0, max: 100 },
}, { _id: false });

const ProposalVersionSchema = new Schema<IProposalVersion>({
  versionNumber: { type: Number, required: true },
  sections: { type: ProposalSectionSchema, required: true },
  pricingBreakdown: { type: PricingBreakdownSchema, required: true },
  aiAnalysis: { type: AiAnalysisSchema, required: true },
  scoreBreakdown: { type: ScoreBreakdownSchema, required: true },
  detectedPainPoints: { type: [String], default: [] },
  aiSuggestions: { type: [String], default: [] },
  promptVersion: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const ProposalSchema = new Schema<IProposal>(
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
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "sent", "won", "lost"],
      default: "draft",
      index: true,
    },
    value: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    platform: {
      type: String,
      enum: {
        values: ["Upwork", "Freelancer", "Fiverr", "LinkedIn", "Direct", "Other"],
        message: "{VALUE} is not a supported freelance platform",
      },
      default: "Other",
      index: true,
    },
    jobPost: {
      type: String,
      required: [true, "Job post content is required"],
    },
    portfolios: {
      type: [String],
      default: [],
    },
    budget: {
      type: Number,
      default: 0,
      min: 0,
    },
    timeline: {
      type: String,
      default: "",
    },
    tone: {
      type: String,
      default: "Professional",
    },
    templateId: {
      type: String,
      default: null,
    },
    activeVersionIndex: {
      type: Number,
      default: 0,
    },
    versions: {
      type: [ProposalVersionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

ProposalSchema.index({ userId: 1, createdAt: -1 });
ProposalSchema.index({ userId: 1, isFavorite: 1 });
ProposalSchema.index({ userId: 1, platform: 1 });
ProposalSchema.index({ userId: 1, status: 1 });

const Proposal: Model<IProposal> =
  mongoose.models.Proposal || mongoose.model<IProposal>("Proposal", ProposalSchema);

export default Proposal;
