import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { User } from "../models/user.model.js";
import { AccountStatus } from "../types/index.js";
import { TypedSocket } from "./socketTypes.js";

export const socketAuthMiddleware = async (
  socket: TypedSocket,
  next: (err?: Error) => void,
) => {
  try {
    const authHeader = socket.handshake.auth?.token;

    if (!authHeader) {
      return next(new Error("Authentication token is required."));
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    socket.data.userId = decoded.userId;
    socket.data.role = decoded.role;

    const user = await User.findById(decoded.userId).select("_id role status");

    if (!user || user.status !== AccountStatus.ACTIVE) {
      return next(new Error("Unauthorized"));
    }

    logger.info(
      {
        socketId: socket.id,
        userId: user._id,
        role: user.role,
      },
      "Socket authenticated",
    );

    next();
  } catch (error) {
    logger.error(
      {
        socketId: socket.id,
        error,
      },
      "Socket authentication failed",
    );

    next(new Error("Unauthorized"));
  }
};
