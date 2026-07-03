import mongoose, { Document, Model, Schema } from "mongoose";

export interface IServiceItem {
  name: string;
  description: string;
  startingPrice: number;
  deliveryTime: string;
  category: string;
  features?: string[];
}

export interface IPersonalInfo {
  fullName: string;
  professionalTitle?: string;
  profilePhoto?: string;
  country?: string;
  timezone?: string;
  languages?: string[];
}

export interface IBusinessInfo {
  companyName?: string;
  structure?: string;
  vatTaxId?: string;
  address?: string;
}

export interface IProfessionalInfo {
  primaryProfession: string;
  yearsOfExperience?: number;
  bio?: string;
  skills: string[];
  services: IServiceItem[];
}

export interface IPricingInfo {
  hourlyRate?: number;
  currency?: string;
  pricingModel?: "hourly" | "fixed" | "custom";
}

export interface IWorkPreferences {
  industries?: string[];
  maxProjects?: number;
  preferredSizes?: string[]; // e.g. "Small (<$2k)", "Medium ($2k-$10k)", "Large (>$10k)"
  projectTypes?: string[];    // e.g. "Fixed", "Retainer", "Hourly"
  weeklyCapacity?: number;    // hours
}

export interface IAiPreferences {
  enableAi: boolean;
  preferredModel?: string;
  autoDraftReplies: boolean;
  contextRefresh?: string;
}

export interface IBrandVoice {
  voiceDescriptors?: string[]; // e.g. ["Bold", "Technical", "Direct", "Minimalist"]
  jargonLevel?: "none" | "low" | "moderate" | "high";
  sentenceStructure?: string;   // e.g. "Short & punchy", "Descriptive & elaborate"
  customPhrases?: string[];
  forbiddenPhrases?: string[];
}

export interface ISocialLinks {
  website?: string;
  github?: string;
  linkedin?: string;
  behance?: string;
  dribbble?: string;
  youtube?: string;
  instagram?: string;
  other?: string;
}

export interface ISystemPreferences {
  preferredProposalTone?: string;
  preferredCurrency?: string;
  defaultTimeline?: string;
  defaultRevisionCount?: number;
}

export interface IFreelancerProfile extends Document {
  userId: string;
  personal: IPersonalInfo;
  business: IBusinessInfo;
  professional: IProfessionalInfo;
  pricing: IPricingInfo;
  workPreferences: IWorkPreferences;
  aiPreferences: IAiPreferences;
  brandVoice: IBrandVoice;
  aiNotes?: string;
  availability: "Available" | "Busy" | "Part-Time" | "Vacation";
  socialLinks: ISocialLinks;
  preferences: ISystemPreferences;
  profileCompleteness: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceItemSchema = new Schema<IServiceItem>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  startingPrice: { type: Number, required: true, default: 0, min: 0 },
  deliveryTime: { type: String, required: true },
  category: { type: String, required: true },
  features: { type: [String], default: [] },
}, { _id: false });

const PersonalInfoSchema = new Schema<IPersonalInfo>({
  fullName: { type: String, required: [true, "Full name is required"] },
  professionalTitle: { type: String, default: "" },
  profilePhoto: { type: String, default: "" },
  country: { type: String, default: "" },
  timezone: { type: String, default: "" },
  languages: { type: [String], default: ["English"] },
}, { _id: false });

const BusinessInfoSchema = new Schema<IBusinessInfo>({
  companyName: { type: String, default: "" },
  structure: { type: String, default: "" },
  vatTaxId: { type: String, default: "" },
  address: { type: String, default: "" },
}, { _id: false });

const ProfessionalInfoSchema = new Schema<IProfessionalInfo>({
  primaryProfession: { type: String, required: [true, "Primary profession is required"] },
  yearsOfExperience: { type: Number, default: 0 },
  bio: { type: String, default: "" },
  skills: {
    type: [String],
    validate: {
      validator: (val: string[]) => val && val.length > 0,
      message: "At least one skill is required",
    },
  },
  services: {
    type: [ServiceItemSchema],
    validate: {
      validator: (val: IServiceItem[]) => val && val.length > 0,
      message: "At least one service is required",
    },
  },
}, { _id: false });

const PricingInfoSchema = new Schema<IPricingInfo>({
  hourlyRate: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: "USD" },
  pricingModel: { type: String, enum: ["hourly", "fixed", "custom"], default: "fixed" },
}, { _id: false });

const WorkPreferencesSchema = new Schema<IWorkPreferences>({
  industries: { type: [String], default: [] },
  maxProjects: { type: Number, default: 3 },
  preferredSizes: { type: [String], default: [] },
  projectTypes: { type: [String], default: [] },
  weeklyCapacity: { type: Number, default: 40 },
}, { _id: false });

const AiPreferencesSchema = new Schema<IAiPreferences>({
  enableAi: { type: Boolean, default: true },
  preferredModel: { type: String, default: "gemini-1.5-flash" },
  autoDraftReplies: { type: Boolean, default: false },
  contextRefresh: { type: String, default: "monthly" },
}, { _id: false });

const BrandVoiceSchema = new Schema<IBrandVoice>({
  voiceDescriptors: { type: [String], default: [] },
  jargonLevel: { type: String, enum: ["none", "low", "moderate", "high"], default: "moderate" },
  sentenceStructure: { type: String, default: "" },
  customPhrases: { type: [String], default: [] },
  forbiddenPhrases: { type: [String], default: [] },
}, { _id: false });

const SocialLinksSchema = new Schema<ISocialLinks>({
  website: { type: String, default: "" },
  github: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  behance: { type: String, default: "" },
  dribbble: { type: String, default: "" },
  youtube: { type: String, default: "" },
  instagram: { type: String, default: "" },
  other: { type: String, default: "" },
}, { _id: false });

const SystemPreferencesSchema = new Schema<ISystemPreferences>({
  preferredProposalTone: { type: String, default: "Professional" },
  preferredCurrency: { type: String, default: "USD" },
  defaultTimeline: { type: String, default: "4 weeks" },
  defaultRevisionCount: { type: Number, default: 3 },
}, { _id: false });

const FreelancerProfileSchema = new Schema<IFreelancerProfile>(
  {
    userId: {
      type: String,
      required: [true, "userId is required"],
      unique: true,
      index: true,
    },
    personal: { type: PersonalInfoSchema, required: true },
    business: { type: BusinessInfoSchema, default: () => ({}) },
    professional: { type: ProfessionalInfoSchema, required: true },
    pricing: { type: PricingInfoSchema, default: () => ({}) },
    workPreferences: { type: WorkPreferencesSchema, default: () => ({}) },
    aiPreferences: { type: AiPreferencesSchema, default: () => ({}) },
    brandVoice: { type: BrandVoiceSchema, default: () => ({}) },
    aiNotes: { type: String, default: "" },
    availability: {
      type: String,
      enum: ["Available", "Busy", "Part-Time", "Vacation"],
      default: "Available",
    },
    socialLinks: { type: SocialLinksSchema, default: () => ({}) },
    preferences: { type: SystemPreferencesSchema, default: () => ({}) },
    profileCompleteness: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const FreelancerProfile: Model<IFreelancerProfile> =
  mongoose.models.FreelancerProfile ||
  mongoose.model<IFreelancerProfile>("FreelancerProfile", FreelancerProfileSchema);

export default FreelancerProfile;
