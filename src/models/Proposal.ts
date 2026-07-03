import mongoose, { Document, Model, Schema } from "mongoose";

export type ProposalStatus = "draft" | "sent" | "won" | "lost";

export interface IProposal extends Document {
  userId: string;
  title: string;
  clientId: mongoose.Types.ObjectId | string;
  status: ProposalStatus;
  value: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

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
      required: [true, "clientId is required"],
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
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user queries
ProposalSchema.index({ userId: 1, createdAt: -1 });
ProposalSchema.index({ userId: 1, status: 1 });

const Proposal: Model<IProposal> =
  mongoose.models.Proposal || mongoose.model<IProposal>("Proposal", ProposalSchema);

export default Proposal;
