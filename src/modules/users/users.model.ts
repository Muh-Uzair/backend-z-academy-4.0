import { Document, model, Schema } from "mongoose";
import { userRoleEnum } from "../auth/auth.validation";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: string;
  isEmailVerified: boolean;
  otp: string | null;
  otpExpiry: Date | null;
  refreshToken: string | null;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },

    role: {
      type: String,
      enum: userRoleEnum.options,
      lowercase: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
      default: null,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },

    refreshToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const UserModel = model<IUser>("User", userSchema);

export default UserModel;
