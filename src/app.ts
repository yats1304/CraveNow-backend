import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import corsOptions from "./config/cors.js";
import helmetMiddleware from "./config/helmet.js";
import { globalLimiter, speedLimiter } from "./config/rate-limit.js";
import { configureTrustProxy } from "./config/trust-proxy.js";
import {
  hppMiddleware,
  mongoSanitizeMiddleware,
  securityAuditMiddleware,
} from "./middleware/security.middleware.js";
import {
  jsonSizeLimit,
  urlEncodedSizeLimit,
} from "./middleware/request-size.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import addressRoutes from "./routes/address.routes.js";
import restaurantRoutes from "./routes/restaurant.routes.js";
import cuisineRoutes from "./routes/cuisine.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import menuItemRoutes from "./routes/menuItems.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import deliveryPartnerRoutes from "./routes/deliveryPartner.routes.js";
import healthRoutes from "./routes/health.routes.js";
import bullBoardRoutes from "./routes/bull-board.routes.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";

const app = express();

configureTrustProxy(app);

app.use(helmetMiddleware);

app.use(cors(corsOptions));

app.use(speedLimiter);
app.use(globalLimiter);

app.use(hppMiddleware);
app.use(mongoSanitizeMiddleware);
app.use(securityAuditMiddleware);

app.use(loggerMiddleware);

app.use("/api/v1/payment/webhook", express.raw({ type: "application/json" }));

app.use(jsonSizeLimit);
app.use(urlEncodedSizeLimit);

app.use(cookieParser());

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/address", addressRoutes);
app.use("/api/v1/restaurant", restaurantRoutes);
app.use("/api/v1/cuisine", cuisineRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/menu-item", menuItemRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/delivery-partner", deliveryPartnerRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/health", healthRoutes);
app.use("/admin/queues", bullBoardRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// global error handler
app.use(globalErrorHandler);

export default app;
