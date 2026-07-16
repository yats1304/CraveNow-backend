import { CounterEntity } from "../types/index.js";
import { Counter } from "../models/counter.model.js";
import mongoose from "mongoose";

export const generateOrderNumber = async (
  session?: mongoose.ClientSession,
): Promise<string> => {
  const now = new Date();

  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}${String(now.getDate()).padStart(2, "0")}`;

  const counter = await Counter.findOneAndUpdate(
    {
      entity: CounterEntity.ORDER,
      date,
    },
    {
      $inc: {
        sequence: 1,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      session,
    },
  );

  const sequence = String(counter.sequence).padStart(6, "0");

  return `ORD${date}${sequence}`;
};
