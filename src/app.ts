import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route";
import addressRoutes from "./routes/address.route";
import restaurantRoutes from "./routes/restaurant.route";
import { globalErrorHandler } from "./middlewares/error.middleware";

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/address", addressRoutes);
app.use("/api/v1/restaurant", restaurantRoutes);

// global error handler
app.use(globalErrorHandler);

export default app;
