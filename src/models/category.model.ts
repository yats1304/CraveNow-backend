import { model } from "mongoose";
import { ICategory } from "../interfaces";
import { categorySchema } from "../schemas/index.js";

export const Category = model<ICategory>("Category", categorySchema);
