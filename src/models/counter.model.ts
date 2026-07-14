import { model } from "mongoose";
import { ICounter } from "../interfaces/index.js";
import { counterSchema } from "../schemas/index.js";

export const Counter = model<ICounter>("Counter", counterSchema);
