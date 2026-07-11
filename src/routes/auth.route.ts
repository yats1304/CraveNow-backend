import express from "express";
import * as authController from "../controllers/index.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  googleLoginSchema,
  loginSchema,
  logoutSchema,
  registerSchema,
  resendOtpSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "../validators/auth.validation.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/verify-otp", validate(verifyOtpSchema), authController.verifyOtp);
router.post("/login", validate(loginSchema), authController.login);
router.post("/resend-otp", validate(resendOtpSchema), authController.resendOtp);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword,
);
router.post("/refresh", authController.refreshToken);
router.post("/logout", isAuth, validate(logoutSchema), authController.logout);
router.post("/google", validate(googleLoginSchema), authController.googleLogin);
router.post(
  "/change-password",
  isAuth,
  validate(changePasswordSchema),
  authController.changePassword,
);
router.get("/me", isAuth, authController.getCurrentUser);

export default router;
