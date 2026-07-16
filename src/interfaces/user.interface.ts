import { Document } from "mongoose";
import { AccountStatus, AuthProvider, UserRole } from "../types/index.js";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  googleId?: string;
  provider?: AuthProvider;
  role: UserRole;
  status: AccountStatus;
  refreshToken?: string;
  totalOrders?: number;
  lastOrderDate?: Date;
  lifetimeSpend?: number;
  averageOrderValue?: number;
  createdAt: Date;
  updatedAt: Date;
}
