import mongoose, { Document, Model, Schema } from "mongoose";
import type { InvitationStatus } from "@/types/portal";

export interface IClientInvitation extends Document {
  freelancerId: string;
  clientId: mongoose.Types.ObjectId;
  email: string;
  token: string;
  status: InvitationStatus;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ClientInvitationSchema = new Schema<IClientInvitation>(
  {
    freelancerId: {
      type: String,
      required: [true, "freelancerId is required"],
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "clientId is required"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      index: true,
    },
    token: {
      type: String,
      required: [true, "Token is required"],
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "revoked"],
      default: "pending",
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ClientInvitationSchema.index({ clientId: 1, status: 1 });
ClientInvitationSchema.index({ email: 1, status: 1 });

const ClientInvitation: Model<IClientInvitation> =
  mongoose.models.ClientInvitation ||
  mongoose.model<IClientInvitation>("ClientInvitation", ClientInvitationSchema);

export default ClientInvitation;
