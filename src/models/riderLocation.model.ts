import { model } from "mongoose";
import { IRiderLocation } from "../interfaces/index.js";
import { riderLocationSchema } from "../schemas/index.js";

export const RiderLocation = model<IRiderLocation>(
  "RiderLocation",
  riderLocationSchema,
);
