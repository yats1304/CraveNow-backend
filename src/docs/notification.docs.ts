export const notificationSchemas = {
  Notification: {
    type: "object",
    properties: {
      id: { type: "string", example: "60c72b2f9b1d8b0015f2ed64" },
      recipientId: { type: "string", example: "60c72b2f9b1d8b0015f2ed65" },
      recipientType: { type: "string", enum: ["CUSTOMER", "RESTAURANT", "DELIVERY_PARTNER", "ADMIN"], example: "CUSTOMER" },
      title: { type: "string", example: "Order Dispatched" },
      message: { type: "string", example: "Your cheeseburger is on its way!" },
      type: { type: "string", enum: ["ORDER_STATUS", "PROMOTIONAL", "SYSTEM", "ALERT"], example: "ORDER_STATUS" },
      isRead: { type: "boolean", example: false },
      readAt: { type: "string", format: "date-time", nullable: true },
      isDeleted: { type: "boolean", example: false },
      deletedAt: { type: "string", format: "date-time", nullable: true },
      channels: {
        type: "array",
        items: { type: "string", enum: ["SOCKET", "PUSH", "EMAIL", "SMS"] },
        example: ["SOCKET", "PUSH"]
      },
      priority: { type: "string", enum: ["LOW", "NORMAL", "HIGH", "CRITICAL"], example: "HIGH" },
      action: { type: "string", enum: ["NAVIGATE", "NONE"], example: "NAVIGATE" },
      actionData: {
        type: "object",
        properties: {
          route: { type: "string", example: "/orders/60c72b2f9b1d8b0015f2ed65" }
        },
        nullable: true
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  BroadcastNotificationInput: {
    type: "object",
    required: ["recipientType", "title", "message", "type"],
    properties: {
      recipientType: { type: "string", enum: ["CUSTOMER", "RESTAURANT", "DELIVERY_PARTNER", "ADMIN"], example: "CUSTOMER" },
      title: { type: "string", example: "Happy Hour Discount!" },
      message: { type: "string", example: "Get 20% off on all dessert category items." },
      type: { type: "string", enum: ["ORDER_STATUS", "PROMOTIONAL", "SYSTEM", "ALERT"], example: "PROMOTIONAL" },
      channels: {
        type: "array",
        items: { type: "string", enum: ["SOCKET", "PUSH", "EMAIL", "SMS"] },
        example: ["SOCKET", "PUSH", "EMAIL"]
      },
      priority: { type: "string", enum: ["LOW", "NORMAL", "HIGH", "CRITICAL"], example: "NORMAL" }
    }
  }
};

export const notificationPaths = {
  "/api/v1/notification": {
    get: {
      summary: "Get notifications list",
      description: "Retrieves a paginated list of active notifications for the authenticated user.",
      tags: ["Notification"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "page",
          in: "query",
          required: false,
          schema: { type: "integer" },
          example: 1
        },
        {
          name: "limit",
          in: "query",
          required: false,
          schema: { type: "integer" },
          example: 10
        },
        {
          name: "isRead",
          in: "query",
          required: false,
          schema: { type: "string", enum: ["true", "false"] },
          example: "false"
        },
        {
          name: "type",
          in: "query",
          required: false,
          schema: { type: "string", enum: ["ORDER_STATUS", "PROMOTIONAL", "SYSTEM", "ALERT"] },
          example: "ORDER_STATUS"
        }
      ],
      responses: {
        200: {
          description: "Notifications list retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  notifications: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Notification" }
                  },
                  pagination: { $ref: "#/components/schemas/Pagination" }
                }
              }
            }
          }
        },
        401: {
          description: "Unauthorized access.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/notification/read-all": {
    patch: {
      summary: "Mark all notifications read",
      description: "Marks all active, unread notifications for the authenticated user as read.",
      tags: ["Notification"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "All notifications marked as read.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  modifiedCount: { type: "integer", example: 5 }
                }
              }
            }
          }
        },
        401: {
          description: "Unauthorized access.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/notification/broadcast": {
    post: {
      summary: "Broadcast notification",
      description: "Sends a promotional or system notification payload to all users matching the recipient role type (Admin only).",
      tags: ["Notification"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/BroadcastNotificationInput" }
          }
        }
      },
      responses: {
        201: {
          description: "Broadcast queued and generated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  notifications: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Notification" }
                  }
                }
              }
            }
          }
        },
        400: {
          description: "Validation error.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } }
        },
        401: {
          description: "Unauthorized access.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        },
        403: {
          description: "Only ADMIN users can trigger broadcasts.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/notification/{notificationId}": {
    get: {
      summary: "Get specific notification details",
      description: "Retrieves details of a single notification by database ID, validating that the requesting user owns it.",
      tags: ["Notification"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "notificationId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      responses: {
        200: {
          description: "Notification details retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  notification: { $ref: "#/components/schemas/Notification" }
                }
              }
            }
          }
        },
        404: {
          description: "Notification not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    },
    delete: {
      summary: "Soft-delete specific notification",
      description: "Marks a specific notification as deleted (isDeleted true) so it won't appear in user lists.",
      tags: ["Notification"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "notificationId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      responses: {
        200: {
          description: "Notification deleted successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Notification deleted successfully." }
                }
              }
            }
          }
        },
        404: {
          description: "Notification not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/notification/{notificationId}/read": {
    patch: {
      summary: "Mark notification as read",
      description: "Marks a single notification as read and updates timestamp (readAt).",
      tags: ["Notification"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "notificationId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      responses: {
        200: {
          description: "Notification marked as read successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  notification: { $ref: "#/components/schemas/Notification" }
                }
              }
            }
          }
        },
        404: {
          description: "Notification not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  }
};
