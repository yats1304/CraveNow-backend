import { model } from "mongoose";
import { IPayment } from "../interfaces/index.js";
import { paymentSchema } from "../schemas/index.js";

export const Payment = model<IPayment>("Payment", paymentSchema);
