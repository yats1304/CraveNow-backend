export const orderSchemas = {
  Order: {
    type: "object",
    properties: {
      id: { type: "string", example: "60c72b2f9b1d8b0015f2ed64" },
      orderNumber: { type: "string", example: "ORD-17212260223" },
      userId: { type: "string", example: "60c72b2f9b1d8b0015f2ed65" },
      restaurantId: { type: "string", example: "60c72b2f9b1d8b0015f2ed66" },
      addressId: { type: "string", example: "60c72b2f9b1d8b0015f2ed67" },
      status: { type: "string", enum: ["PLACED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"], example: "PLACED" },
      cancelledAt: { type: "string", format: "date-time", nullable: true },
      cancelledBy: { type: "string", enum: ["CUSTOMER", "RESTAURANT", "ADMIN"], nullable: true, example: "CUSTOMER" },
      cancellationReason: { type: "string", nullable: true, example: "Decided to cook instead." },
      paymentStatus: { type: "string", enum: ["PENDING", "PAID", "FAILED", "REFUNDED"], example: "PENDING" },
      paymentMethod: { type: "string", enum: ["COD", "ONLINE"], example: "ONLINE" },
      subtotal: { type: "number", example: 270 },
      discount: { type: "number", example: 0 },
      tax: { type: "number", example: 13.5 },
      deliveryFee: { type: "number", example: 30 },
      total: { type: "number", example: 313.5 },
      estimatedDeliveryTime: { type: "string", format: "date-time", example: "2026-07-17T12:45:00Z" },
      notes: { type: "string", example: "Leave at door.", nullable: true },
      items: {
        type: "array",
        items: { $ref: "#/components/schemas/OrderItem" }
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  OrderItem: {
    type: "object",
    properties: {
      id: { type: "string", example: "60c72b2f9b1d8b0015f2ed68" },
      orderId: { type: "string", example: "60c72b2f9b1d8b0015f2ed64" },
      menuItemId: { type: "string", example: "60c72b2f9b1d8b0015f2ed69" },
      nameSnapshot: { type: "string", example: "Cheeseburger" },
      unitPriceSnapshot: { type: "number", example: 135 },
      quantity: { type: "integer", example: 2 },
      totalPrice: { type: "number", example: 270 },
      specialInstructions: { type: "string", example: "No onions, please.", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  CreateOrderInput: {
    type: "object",
    required: ["addressId", "paymentMethod"],
    properties: {
      addressId: { type: "string", example: "60c72b2f9b1d8b0015f2ed67" },
      paymentMethod: { type: "string", enum: ["COD", "ONLINE"], example: "ONLINE" },
      notes: { type: "string", example: "Call me when outside." }
    }
  },
  UpdateOrderStatusInput: {
    type: "object",
    required: ["status"],
    properties: {
      status: { type: "string", enum: ["PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"], example: "PREPARING" }
    }
  },
  CancelOrderInput: {
    type: "object",
    required: ["reason"],
    properties: {
      reason: { type: "string", example: "Changed my mind." }
    }
  }
};

export const orderPaths = {
  "/api/v1/order": {
    post: {
      summary: "Create order from cart",
      description: "Places a new order based on the user's current active cart items, shipping details, and payment choices.",
      tags: ["Order"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateOrderInput" }
          }
        }
      },
      responses: {
        201: {
          description: "Order placed successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Order placed successfully." },
                  order: { $ref: "#/components/schemas/Order" }
                }
              }
            }
          }
        },
        400: {
          description: "Validation error or cart is empty/invalid.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } }
        },
        401: {
          description: "Unauthorized.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    },
    get: {
      summary: "Get my orders list",
      description: "Retrieves a list of order history for the authenticated customer user.",
      tags: ["Order"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Customer orders list retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  orders: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Order" }
                  }
                }
              }
            }
          }
        },
        401: {
          description: "Unauthorized.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/order/restaurant": {
    get: {
      summary: "Get restaurant orders list",
      description: "Retrieves orders registered for the authenticated partner's restaurant.",
      tags: ["Order"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Restaurant orders list retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  orders: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Order" }
                  }
                }
              }
            }
          }
        },
        401: {
          description: "Unauthorized.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/order/restaurant/{orderId}": {
    get: {
      summary: "Get restaurant order details",
      description: "Retrieves complete details of a specific order belonging to the restaurant.",
      tags: ["Order"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      responses: {
        200: {
          description: "Restaurant order details retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  order: { $ref: "#/components/schemas/Order" }
                }
              }
            }
          }
        },
        404: {
          description: "Order not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/order/restaurant/{orderId}/status": {
    patch: {
      summary: "Update restaurant order status",
      description: "Updates the status of an order (e.g. PREPARING, READY) by the restaurant owner.",
      tags: ["Order"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateOrderStatusInput" }
          }
        }
      },
      responses: {
        200: {
          description: "Order status updated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Order status updated successfully." },
                  order: { $ref: "#/components/schemas/Order" }
                }
              }
            }
          }
        },
        400: {
          description: "Invalid validation status.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } }
        },
        404: {
          description: "Order not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/order/{orderId}": {
    get: {
      summary: "Get order details",
      description: "Retrieves complete details of a specific order for the authenticated customer.",
      tags: ["Order"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      responses: {
        200: {
          description: "Order details retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  order: { $ref: "#/components/schemas/Order" }
                }
              }
            }
          }
        },
        404: {
          description: "Order not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/order/{orderId}/cancel": {
    patch: {
      summary: "Cancel an order",
      description: "Allows the customer to cancel their order if it hasn't been prepared or dispatched yet.",
      tags: ["Order"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CancelOrderInput" }
          }
        }
      },
      responses: {
        200: {
          description: "Order cancelled successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Order cancelled successfully." },
                  order: { $ref: "#/components/schemas/Order" }
                }
              }
            }
          }
        },
        400: {
          description: "Cancellation not permitted at this order state.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        },
        404: {
          description: "Order not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  }
};
