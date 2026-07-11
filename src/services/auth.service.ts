import { redisClient } from "../config/redis.js";
import {
  getRefreshKey,
  MAX_OTP_RESEND,
  OTP_EXPIRY,
  OTP_RESEND_COOLDOWN,
  REFRESH_TOKEN_EXPIRY,
} from "../constants/index.js";
import { User } from "../models/index.js";
import { verificationEmailTemplate } from "../templates/email-verification.template.js";
import { welcomeEmailTemplate } from "../templates/welcome.template.js";
import {
  AccountStatus,
  AuthProvider,
  ChangePasswordDto,
  ForgotPasswordDto,
  GoogleLoginDto,
  GoogleUser,
  LoginDto,
  LogoutDto,
  refreshTokenDto,
  RegisterUserDto,
  ResentOtpDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from "../types/index.js";
import {
  hashPassword,
  ErrorHandler,
  generateOtp,
  sendMail,
  generateAccessToken,
  generateRefreshToken,
  comparePassword,
  verifyRefreshToken,
} from "../utils/index.js";
import { forgotPasswordTemplate } from "../templates/forgot-password.template.js";
import { verifyGoogleIdToken } from "../utils/google.js";
import { createUserSession } from "../helper/index.js";

export const registerUser = async (registerData: RegisterUserDto) => {
  const { name, email, password, phone, role } = registerData;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ErrorHandler(409, "User already exits");
  }

  const registerKey = `register:${email}`;

  const existingOtp = await redisClient.get(registerKey);

  if (existingOtp) {
    throw new ErrorHandler(
      429,
      "OTP already sent. Please wait before requesting another.",
    );
  }

  const hashedPassword = await hashPassword(password);

  const otp = generateOtp();

  await redisClient.set(
    registerKey,
    JSON.stringify({
      otp,
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      resendCount: 0,
      lastOtpSentAt: Date.now(),
    }),
    { EX: OTP_EXPIRY },
  );

  try {
    await sendMail({
      to: email,
      subject: "Verify your CraveNow Account",
      html: verificationEmailTemplate({ name, otp }),
    });
  } catch (error: any) {
    await redisClient.del(registerKey);
    throw new ErrorHandler(500, "Failed to send verification email");
  }

  return {
    success: true,
    message: "Verification OTP has been sent to your email.",
  };
};

// Verify OTP
export const verifyOtp = async (otpData: VerifyOtpDto) => {
  const { email, otp, deviceId } = otpData;
  const registerKey = `register:${email}`;

  const registerData = await redisClient.get(registerKey);

  if (!registerData) {
    throw new ErrorHandler(
      400,
      "OTP expired or registration session not found.",
    );
  }

  const data = JSON.parse(registerData);

  if (data.otp !== otp) {
    throw new ErrorHandler(400, "Invalid OTP");
  }

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    phone: data.phone,
    role: data.role,
  });

  await redisClient.del(registerKey);

  const { accessToken, refreshToken } = await createUserSession({
    userId: user._id.toString(),
    role: user.role,
    deviceId,
  });

  await sendMail({
    to: user.email,
    subject: "Welcome to CraveNow",
    html: welcomeEmailTemplate({ name: user.name }),
  });

  return {
    success: true,
    message: "Email verified successfully.",
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

// Login
export const login = async (loginData: LoginDto) => {
  const { email, password, deviceId } = loginData;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorHandler(401, "Invalid email or password");
  }

  if (user.provider === AuthProvider.GOOGLE) {
    throw new ErrorHandler(400, "Please login with Google");
  }

  if (user.status === AccountStatus.BLOCKED) {
    throw new ErrorHandler(403, "Your account has been blocked");
  }

  const isPasswordCorrect = await comparePassword(password, user.password!);

  if (!isPasswordCorrect) {
    throw new ErrorHandler(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = await createUserSession({
    userId: user._id.toString(),
    role: user.role,
    deviceId,
  });

  return {
    success: true,
    message: "Login successful",
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

// Resend OTP
export const resendOtp = async ({ email }: ResentOtpDto) => {
  const registerKey = `register:${email}`;

  const registerData = await redisClient.get(registerKey);

  if (!registerData) {
    throw new ErrorHandler(
      404,
      "Registration session expired. Please register again.",
    );
  }

  const data = JSON.parse(registerData);

  if (data.resendCount >= MAX_OTP_RESEND) {
    throw new ErrorHandler(429, "Maximum OTP resend attempts reached");
  }

  const now = Date.now();

  const elapsedTime = now - data.lastOtpSentAt;

  if (elapsedTime < OTP_RESEND_COOLDOWN * 1000) {
    const remainingSeconds = Math.ceil(
      (OTP_RESEND_COOLDOWN * 1000 - elapsedTime) / 1000,
    );

    throw new ErrorHandler(
      429,
      `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
    );
  }

  const otp = generateOtp();

  data.otp = otp;
  data.resendCount += 1;
  data.lastOtpSentAt = now;

  const ttl = await redisClient.ttl(registerKey);

  await redisClient.set(registerKey, JSON.stringify(data), {
    EX: ttl > 0 ? ttl : OTP_EXPIRY,
  });

  try {
    await sendMail({
      to: email,
      subject: "Your New Verification OTP - CraveNow",
      html: verificationEmailTemplate({
        name: data.name,
        otp,
      }),
    });
  } catch (error) {
    throw new ErrorHandler(500, "Failed to send verification email.");
  }

  return {
    success: true,
    message: "A new OTP has been sent to your email.",
  };
};

// Forgot Password
export const forgotPassword = async ({ email }: ForgotPasswordDto) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorHandler(
      401,
      "If an account exists with this email, a password reset OTP has been sent.",
    );
  }

  if (user.provider === AuthProvider.GOOGLE) {
    throw new ErrorHandler(400, "Please login with Google");
  }

  if (user.status === AccountStatus.BLOCKED) {
    throw new ErrorHandler(403, "Your account has been blocked");
  }

  const forgotKey = `forgot:${email}`;

  const existingData = await redisClient.get(forgotKey);

  let resendCount = 0;

  if (existingData) {
    const data = JSON.parse(existingData);

    if (data.resendCount >= MAX_OTP_RESEND) {
      throw new ErrorHandler(429, "Maximum OTP resend attempts reached.");
    }

    const elapsed = Date.now() - data.lastOtpSentAt;

    if (elapsed < OTP_RESEND_COOLDOWN * 1000) {
      const seconds = Math.ceil((OTP_RESEND_COOLDOWN * 1000 - elapsed) / 1000);

      throw new ErrorHandler(
        429,
        `Please wait ${seconds} seconds before requesting another OTP.`,
      );
    }

    resendCount = data.resendCount + 1;
  }

  const otp = generateOtp();
  const now = Date.now();

  await redisClient.set(
    forgotKey,
    JSON.stringify({ otp, resendCount, lastOtpSentAt: now }),
    { EX: OTP_EXPIRY },
  );

  try {
    await sendMail({
      to: email,
      subject: "Reset Your CraveNow Password",
      html: forgotPasswordTemplate({
        name: user.name,
        otp,
      }),
    });
  } catch {
    await redisClient.del(forgotKey);

    throw new ErrorHandler(500, "Failed to send reset email.");
  }

  return {
    success: true,
    message: "OTP sent successfully.",
  };
};

// reset password
export const resetPassword = async ({
  email,
  otp,
  password,
}: ResetPasswordDto) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorHandler(404, "User not found.");
  }

  const forgotKey = `forgot:${email}`;

  const forgotData = await redisClient.get(forgotKey);

  if (!forgotData) {
    throw new ErrorHandler(400, "OTP expired or reset session not found.");
  }

  const data = JSON.parse(forgotData);

  if (data.otp !== otp) {
    throw new ErrorHandler(400, "Invalid OTP.");
  }

  const hashedPassword = await hashPassword(password);

  user.password = hashedPassword;

  await user.save();

  await redisClient.del(forgotKey);

  const userId = user._id.toString();

  for await (const keys of redisClient.scanIterator({
    MATCH: `refresh:${userId}:*`,
    COUNT: 100,
  })) {
    if (keys.length) {
      await Promise.all(keys.map((key) => redisClient.del(key)));
    }
  }

  return {
    success: true,
    message: "Password reset successfully. Please login again.",
  };
};

// Refresh Token
export const refreshToken = async ({
  refreshToken,
  deviceId,
}: refreshTokenDto) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new ErrorHandler(401, "Invalid refresh token.");
  }

  const user = await User.findById(payload.userId);

  if (!user) {
    throw new ErrorHandler(401, "User not found.");
  }

  if (user.status === AccountStatus.BLOCKED) {
    throw new ErrorHandler(403, "Your account has been blocked.");
  }

  const refreshKey = getRefreshKey(user._id.toString(), deviceId);

  const storedToken = await redisClient.get(refreshKey);

  if (!storedToken) {
    throw new ErrorHandler(401, "Refresh token expired. Please login again.");
  }

  if (refreshToken !== storedToken) {
    throw new ErrorHandler(401, "Invalid refresh token.");
  }

  const jwtPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  const newAccessToken = generateAccessToken(jwtPayload);
  const newRefreshToken = generateRefreshToken(jwtPayload);

  await redisClient.set(refreshKey, newRefreshToken, {
    EX: REFRESH_TOKEN_EXPIRY,
  });

  return {
    success: true,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// Logout
export const logout = async ({ userId, deviceId }: LogoutDto) => {
  const refreshKey = getRefreshKey(userId, deviceId);

  const exists = await redisClient.exists(refreshKey);

  if (!exists) {
    throw new ErrorHandler(401, "Session not found or already logged out.");
  }

  await redisClient.del(refreshKey);

  return {
    success: true,
    message: "Logged out successfully.",
  };
};

export const googleLogin = async ({ idToken, deviceId }: GoogleLoginDto) => {
  const googleUser: GoogleUser = await verifyGoogleIdToken(idToken);

  let user = await User.findOne({ email: googleUser.email });

  if (user && user.provider === AuthProvider.LOCAL) {
    throw new ErrorHandler(
      409,
      "This email is already registered with email and password",
    );
  }

  if (user?.status === AccountStatus.BLOCKED) {
    throw new ErrorHandler(403, "Your account has been blocked");
  }

  if (!user) {
    user = await User.create({
      name: googleUser.name,
      email: googleUser.email,
      avatar: googleUser.avatar,
      googleId: googleUser.googleId,
      provider: AuthProvider.GOOGLE,
    });
  }

  const { accessToken, refreshToken } = await createUserSession({
    userId: user._id.toString(),
    role: user.role,
    deviceId,
  });

  return {
    success: true,
    message: "Login successful.",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      provider: user.provider,
    },
    accessToken,
    refreshToken,
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new ErrorHandler(404, "User not found.");
  }

  return {
    success: true,
    user,
  };
};

export const changePassword = async ({
  userId,
  currentPassword,
  newPassword,
  deviceId,
}: ChangePasswordDto) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorHandler(404, "User not found.");
  }

  if (user.provider === AuthProvider.GOOGLE) {
    throw new ErrorHandler(400, "Google accounts cannot change password.");
  }

  const isPasswordCorrect = await comparePassword(
    currentPassword,
    user.password!,
  );

  if (!isPasswordCorrect) {
    throw new ErrorHandler(400, "Current password is incorrect");
  }

  const isSamePassword = await comparePassword(newPassword, user.password!);

  if (isSamePassword) {
    throw new ErrorHandler(
      400,
      "New password cannot be same as current password.",
    );
  }

  user.password = await hashPassword(newPassword);

  await user.save();

  for await (const keys of redisClient.scanIterator({
    MATCH: `refresh:${userId}:*`,
    COUNT: 100,
  })) {
    const keysToDelete = keys.filter(
      (key) => key !== getRefreshKey(userId, deviceId),
    );

    if (keysToDelete.length) {
      await Promise.all(keysToDelete.map((key) => redisClient.del(key)));
    }
  }

  const session = await createUserSession({
    userId,
    role: user.role,
    deviceId,
  });

  return {
    success: true,
    message: "Password changed successfully.",
    ...session,
  };
};
