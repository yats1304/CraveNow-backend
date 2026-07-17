import { model } from "mongoose";
import { INotification } from "../interfaces/index.js";
import { notificationSchema } from "../schemas/notification.schema.js";

export const Notification = model<INotification>(
  "Notification",
  notificationSchema,
);
