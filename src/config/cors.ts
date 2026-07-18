import { CorsOptions } from "cors";
import { env } from "./env.js";

const allowedOrigins = env.CLIENT_URL ? env.CLIENT_URL.split(",") : ["*"];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.indexOf("*") !== -1 ||
      allowedOrigins.indexOf(origin) !== -1
    ) {
      return callback(null, true);
    }

    return callback(new Error("Blocked by CORS policy"), false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
export default corsOptions;
