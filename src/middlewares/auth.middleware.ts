import { User } from "../models/index.js";
import { AccountStatus } from "../types/index.js";
import { ErrorHandler, TryCatch, verifyAccessToken } from "../utils/index.js";

export const isAuth = TryCatch(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : undefined;

  const tokenFromCookie = req.cookies?.accessToken;

  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    throw new ErrorHandler(401, "Access token is missing");
  }

  const payload = verifyAccessToken(token);

  const user = await User.findById(payload.userId).select("-password");

  if (!user) {
    throw new ErrorHandler(404, "User not found");
  }

  if (user.status === AccountStatus.BLOCKED) {
    throw new ErrorHandler(403, "Your account has been blocked");
  }

  req.user = {
    userId: user._id.toString(),
    role: user.role,
  };

  next();
});
