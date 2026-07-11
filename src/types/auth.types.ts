import { UserRole } from "./user.types.js";

export type JwtPayload = {
  userId: string;
  role: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
  deviceId: string;
}

export interface LoginDto {
  email: string;
  password: string;
  deviceId: string;
}

export interface ResentOtpDto {
  email: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  password: string;
}

export interface refreshTokenDto {
  refreshToken: string;
  deviceId: string;
}

export interface LogoutDto {
  userId: string;
  deviceId: string;
}

export interface GoogleLoginDto {
  idToken: string;
  deviceId: string;
}
export interface ChangePasswordDto {
  userId: string;
  currentPassword: string;
  newPassword: string;
  deviceId: string;
}

export interface GoogleUser {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified?: boolean;
}
