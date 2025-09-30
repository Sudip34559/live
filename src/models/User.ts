import { Schema, model, Document, models } from "mongoose";
import { boolean } from "zod";

export type GlobalRole = "admin" | "user";

export interface IUser extends Document {
  name: string;
  email: string;
  globalRole: GlobalRole; // system-level role (admin or normal user)
  image?: string;
  isProfileComplete: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true },
    email: { type: String, unique: true, lowercase: true },
    globalRole: { type: String, enum: ["admin", "user"], default: "user" },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    image: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);
