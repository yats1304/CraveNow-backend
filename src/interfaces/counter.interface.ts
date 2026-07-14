import { Document } from "mongoose";
import { CounterEntity } from "../types";

export interface ICounter extends Document {
  entity: CounterEntity;
  date: string;
  sequence: number;
  createdAt: Date;
  updatedAt: Date;
}
