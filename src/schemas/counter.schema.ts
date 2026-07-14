import { Schema } from "mongoose";
import { ICounter } from "../interfaces/index.js";
import { CounterEntity } from "../types/index.js";

export const counterSchema = new Schema<ICounter>(
  {
    entity: {
      type: String,
      enum: Object.values(CounterEntity),
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    sequence: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

counterSchema.index(
  {
    entity: 1,
    date: 1,
  },
  {
    unique: true,
  },
);
