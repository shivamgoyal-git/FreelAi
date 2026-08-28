import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  password?: string; // Optional — not set for Google OAuth users
  role: "freelancer" | "client";
  clientId?: mongoose.Types.ObjectId | string;
  onboardingCompleted?: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Never returned in queries unless explicitly requested
    },
    role: {
      type: String,
      enum: ["freelancer", "client"],
      default: "freelancer",
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // only createdAt
  }
);

// Prevent model re-compilation during Next.js hot-reload
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
