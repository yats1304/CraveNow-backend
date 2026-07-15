import { Document, Types } from "mongoose";

export interface IRiderLocation extends Document {
  deliveryPartnerId: Types.ObjectId;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  heading?: number;
  speed?: number;
  accuracy?: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}
