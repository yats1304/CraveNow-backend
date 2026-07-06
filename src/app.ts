import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.router";
import { globalErrorHandler } from "./middlewares/error.middleware";

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/v1/auth", authRoutes);

// global error handler — must be registered AFTER all routes
app.use(globalErrorHandler);

export default app;
