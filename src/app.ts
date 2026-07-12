import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import addressRoutes from "./routes/address.route.js";
import restaurantRoutes from "./routes/restaurant.route.js";
import cuisineRoutes from "./routes/cuisine.routes.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/address", addressRoutes);
app.use("/api/v1/restaurant", restaurantRoutes);
app.use("/api/v1/cuisine", cuisineRoutes);

// global error handler
app.use(globalErrorHandler);

export default app;
