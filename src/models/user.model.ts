import { model } from "mongoose";
import { IUser } from "../interfaces";
import { userSchema } from "../schemas";

export const User = model<IUser>("User", userSchema);
