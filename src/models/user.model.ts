import { model } from "mongoose";
import { IUser } from "../interfaces/index.js";
import { userSchema } from "../schemas/index.js";

export const User = model<IUser>("User", userSchema);
