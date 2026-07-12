import z from "zod";

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

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

export const fileSchema = (options: {
  fieldname: string;
  maxSize?: number;
  allowedMimetypes?: string[];
}) => {
  const { fieldname, maxSize = 5 * 1024 * 1024, allowedMimetypes = ["image/"] } = options;
  return z.object({
    fieldname: z.literal(fieldname, {
      message: `Field name must be '${fieldname}'`,
    }),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string().refine(
      (val) => allowedMimetypes.some((mime) => val.startsWith(mime)),
      { message: `Only ${allowedMimetypes.map(m => m.endsWith('/') ? m.slice(0, -1) + ' files' : m).join(", ")} are allowed` }
    ),
    size: z.number().max(maxSize, `File size must be less than ${maxSize / (1024 * 1024)}MB`),
    buffer: z.any(),
  });
};
