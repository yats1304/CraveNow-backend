import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import addressRoutes from "./routes/address.routes.js";
import restaurantRoutes from "./routes/restaurant.routes.js";
import cuisineRoutes from "./routes/cuisine.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import menuItemRoutes from "./routes/menuItems.routes.js";
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
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/menu-item", menuItemRoutes);

// global error handler
app.use(globalErrorHandler);

export default app;
