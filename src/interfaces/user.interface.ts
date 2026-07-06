import { Document } from "mongoose";
import { AccountStatus, AuthProvider, UserRole } from "../types";

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
  createdAt: Date;
  updatedAt: Date;
}
