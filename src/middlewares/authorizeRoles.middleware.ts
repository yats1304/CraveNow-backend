import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types/index.js";
import { ErrorHandler } from "../utils/index.js";

export const authorizeRoles =
  (...roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ErrorHandler(401, "Unauthorized");
    }

    if (!roles.includes(req.user.role as UserRole)) {
      throw new ErrorHandler(
        403,
        "You are not authorized to access this resource.",
      );
    }

    next();
  };
