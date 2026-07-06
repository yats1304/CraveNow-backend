import z from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email("Invalid email address")
  .toLowerCase();

export const passwordSchema = z
  .string()
  .min(8)
  .max(32)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]+$/,
    "Password must contain uppercase, lowercase, number and special character",
  );

export const otpSchema = z
  .string()
  .length(6, "OTP must be 6 digits")
  .regex(/^\d+$/, "OTP must contain only numbers");

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Invalid phone number")
  .optional();

export const deviceIdSchema = z
  .string()
  .trim()
  .min(1, "Device ID is required")
  .max(255, "Device ID is too long");
