import * as authService from "../services/index.js";
import { ErrorHandler, setAuthCookies, TryCatch } from "../utils/index.js";

export const register = TryCatch(async (req, res) => {
  const data = await authService.registerUser(req.body);

  return res.status(201).json(data);
});

export const verifyOtp = TryCatch(async (req, res) => {
  const data = await authService.verifyOtp(req.body);

  setAuthCookies(res, data.accessToken, data.refreshToken);

  return res.status(201).json(data);
});

export const login = TryCatch(async (req, res) => {
  const data = await authService.login(req.body);

  setAuthCookies(res, data.accessToken, data.refreshToken);

  return res.json(data);
});

export const resendOtp = TryCatch(async (req, res) => {
  const data = await authService.resendOtp(req.body);

  return res.json(data);
});

export const forgotPassword = TryCatch(async (req, res) => {
  const data = await authService.forgotPassword(req.body);

  return res.json(data);
});

export const resetPassword = TryCatch(async (req, res) => {
  const data = await authService.resetPassword(req.body);

  return res.json(data);
});

export const refreshToken = TryCatch(async (req, res) => {
  const authHeader = req.headers.authorization;
  const { deviceId } = req.body;
  const tokenFromHeader = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : undefined;

  const tokenFromCookie = req.cookies?.refreshToken;

  const refreshToken = tokenFromHeader || tokenFromCookie;

  if (!refreshToken) {
    throw new ErrorHandler(401, "Refresh token is required.");
  }

  if (!deviceId) {
    throw new ErrorHandler(400, "Device ID is required.");
  }

  const data = await authService.refreshToken({ refreshToken, deviceId });

  if (tokenFromCookie) {
    setAuthCookies(res, data.accessToken, data.refreshToken);

    return res.json({
      success: true,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }

  return res.json(data);
});

export const logout = TryCatch(async (req, res) => {
  const { deviceId } = req.body;

  if (!deviceId) {
    throw new ErrorHandler(400, "Device ID is required.");
  }

  const userId = req.user!.userId;

  const data = await authService.logout({ userId, deviceId });

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.json(data);
});

export const googleLogin = TryCatch(async (req, res) => {
  const data = await authService.googleLogin(req.body);

  setAuthCookies(res, data.accessToken, data.refreshToken);

  return res.json(data);
});

export const getCurrentUser = TryCatch(async (req, res) => {
  const userId = req.user?.userId;

  const data = await authService.getCurrentUser(userId as string);

  return res.json(data);
});

export const changePassword = TryCatch(async (req, res) => {
  const userId = req.user!.userId;

  const data = await authService.changePassword({
    userId,
    ...req.body,
  });

  setAuthCookies(res, data.accessToken, data.refreshToken);

  return res.json(data);
});
