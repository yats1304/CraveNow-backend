import { Schema } from "mongoose";
import { IUser } from "../interfaces/index.js";

import { AccountStatus, AuthProvider, UserRole } from "../types/index.js";

export const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
    },

    phone: {
      type: String,
    },

    avatar: {
      type: String,
    },

    googleId: {
      type: String,
    },

    provider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.LOCAL,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
    },

    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.ACTIVE,
    },

    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);
