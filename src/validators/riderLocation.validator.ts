import { z } from "zod";

export const updateLocationSchema = z.object({
  latitude: z
    .number({
      message: "Latitude is required and must be a number",
    })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),

  longitude: z
    .number({
      message: "Longitude is required and must be a number",
    })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),

  heading: z
    .number({
      message: "Heading must be a number",
    })
    .min(0, "Heading must be between 0 and 360")
    .max(360, "Heading must be between 0 and 360")
    .optional(),

  speed: z
    .number({
      message: "Speed must be a number",
    })
    .min(0, "Speed cannot be negative")
    .optional(),

  accuracy: z
    .number({
      message: "Accuracy must be a number",
    })
    .min(0, "Accuracy cannot be negative")
    .optional(),
});
