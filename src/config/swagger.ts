import swaggerJSDoc from "swagger-jsdoc";
import { env } from "./env.js";
import { commonSchemas } from "../docs/common.schemas.js";
import { authPaths, authSchemas } from "../docs/auth.docs.js";
import { userPaths, userSchemas } from "../docs/user.docs.js";
import { addressPaths, addressSchemas } from "../docs/address.docs.js";
import { restaurantPaths, restaurantSchemas } from "../docs/restaurant.docs.js";
import { categoryPaths, categorySchemas } from "../docs/category.docs.js";
import { menuPaths, menuSchemas } from "../docs/menu.docs.js";
import { cartPaths, cartSchemas } from "../docs/cart.docs.js";
import { orderPaths, orderSchemas } from "../docs/order.docs.js";
import { paymentPaths, paymentSchemas } from "../docs/payment.docs.js";
import { deliveryPaths, deliverySchemas } from "../docs/delivery.docs.js";
import { notificationPaths, notificationSchemas } from "../docs/notification.docs.js";
import { healthPaths, healthSchemas } from "../docs/health.docs.js";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "CraveNow Backend API Documentation",
      description: "Production-ready, interactive API reference for CraveNow on Node.js/Express/TypeScript stack.",
      version: "1.0.0",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token in the format: Bearer <token>",
        },
      },
      schemas: {
        ...commonSchemas,
        ...authSchemas,
        ...userSchemas,
        ...addressSchemas,
        ...restaurantSchemas,
        ...categorySchemas,
        ...menuSchemas,
        ...cartSchemas,
        ...orderSchemas,
        ...paymentSchemas,
        ...deliverySchemas,
        ...notificationSchemas,
        ...healthSchemas,
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      ...authPaths,
      ...userPaths,
      ...addressPaths,
      ...restaurantPaths,
      ...categoryPaths,
      ...menuPaths,
      ...cartPaths,
      ...orderPaths,
      ...paymentPaths,
      ...deliveryPaths,
      ...notificationPaths,
      ...healthPaths,
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
