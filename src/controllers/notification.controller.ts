import { Request, Response } from "express";
import * as notificationService from "../services/notification.service.js";
import { TryCatch } from "../utils/index.js";
import {
  NotificationType,
  NotificationRecipientType,
  NotificationChannel,
  NotificationPriority,
} from "../types/index.js";

export const getNotifications = TryCatch(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const isRead =
      req.query.isRead !== undefined ? req.query.isRead === "true" : undefined;
    const type = req.query.type as NotificationType | undefined;

    const result = await notificationService.getNotifications(
      userId,
      page,
      limit,
      isRead,
      type,
    );

    return res.status(200).json(result);
  },
);

export const getNotificationById = TryCatch(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const notificationId = req.params.notificationId as string;

    const result = await notificationService.getNotificationById(
      userId,
      notificationId,
    );

    return res.status(200).json(result);
  },
);

export const markAsRead = TryCatch(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const notificationId = req.params.notificationId as string;

  const result = await notificationService.markAsRead(userId, notificationId);

  return res.status(200).json(result);
});

export const markAllAsRead = TryCatch(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const result = await notificationService.markAllAsRead(userId);

  return res.status(200).json(result);
});

export const deleteNotification = TryCatch(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const notificationId = req.params.notificationId as string;

    const result = await notificationService.deleteNotification(
      userId,
      notificationId,
    );

    return res.status(200).json(result);
  },
);

export const broadcastNotification = TryCatch(
  async (req: Request, res: Response) => {
    const {
      recipientType,
      title,
      message,
      type,
      channels,
      priority,
    }: {
      recipientType: NotificationRecipientType;
      title: string;
      message: string;
      type: NotificationType;
      channels?: NotificationChannel[];
      priority?: NotificationPriority;
    } = req.body;

    const result = await notificationService.broadcastNotification(
      recipientType,
      title,
      message,
      type,
      channels,
      priority,
    );

    return res.status(201).json(result);
  },
);
