export const paymentSchemas = {
  Payment: {
    type: "object",
    properties: {
      id: { type: "string", example: "60c72b2f9b1d8b0015f2ed64" },
      orderId: { type: "string", example: "60c72b2f9b1d8b0015f2ed65" },
      userId: { type: "string", example: "60c72b2f9b1d8b0015f2ed66" },
      gateway: { type: "string", enum: ["COD", "ONLINE"], example: "ONLINE" },
      status: { type: "string", enum: ["PENDING", "PAID", "FAILED", "REFUNDED"], example: "PAID" },
      amount: { type: "number", example: 313.5 },
      currency: { type: "string", example: "INR" },
      gatewayOrderId: { type: "string", example: "order_G8dJ3mN9kPqR2s" },
      receipt: { type: "string", example: "rcpt_60c72b2f9b1d8b001" },
      gatewayPaymentId: { type: "string", example: "pay_H1a2b3c4d5e6f7" },
      gatewaySignature: { type: "string", example: "9b626ef7e72251a3d601b38..." },
      paidAt: { type: "string", format: "date-time", nullable: true },
      refundedAt: { type: "string", format: "date-time", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  CreatePaymentInput: {
    type: "object",
    required: ["orderId"],
    properties: {
      orderId: { type: "string", example: "60c72b2f9b1d8b0015f2ed65" }
    }
  },
  VerifyPaymentInput: {
    type: "object",
    required: ["razorpay_order_id", "razorpay_payment_id", "razorpay_signature"],
    properties: {
      razorpay_order_id: { type: "string", example: "order_G8dJ3mN9kPqR2s" },
      razorpay_payment_id: { type: "string", example: "pay_H1a2b3c4d5e6f7" },
      razorpay_signature: { type: "string", example: "9b626ef7e72251a3d601b38..." }
    }
  }
};

export const paymentPaths = {
  "/api/v1/payment/create-order": {
    post: {
      summary: "Create gateway order",
      description: "Registers a payment session with Razorpay and generates a gateway order ID for client checkout initialization.",
      tags: ["Payment"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreatePaymentInput" }
          }
        }
      },
      responses: {
        201: {
          description: "Gateway order generated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  payment: { $ref: "#/components/schemas/Payment" }
                }
              }
            }
          }
        },
        400: {
          description: "Invalid order or validation error.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } }
        },
        401: {
          description: "Unauthorized.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/payment/verify": {
    post: {
      summary: "Verify gateway signature",
      description: "Verifies the Razorpay payment signature after successful checkout client side, updating payment and order status.",
      tags: ["Payment"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/VerifyPaymentInput" }
          }
        }
      },
      responses: {
        200: {
          description: "Payment verified successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Payment verified successfully." },
                  payment: { $ref: "#/components/schemas/Payment" }
                }
              }
            }
          }
        },
        400: {
          description: "Signature mismatch verification failed.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/payment/order/{orderId}": {
    get: {
      summary: "Get payment by order ID",
      description: "Retrieves the payment records associated with a specific order ID.",
      tags: ["Payment"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed65"
        }
      ],
      responses: {
        200: {
          description: "Payment records retrieved.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  payment: { $ref: "#/components/schemas/Payment" }
                }
              }
            }
          }
        },
        404: {
          description: "Payment record not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/payment/{paymentId}": {
    get: {
      summary: "Get payment details by ID",
      description: "Retrieves complete details of a specific payment using its database ID.",
      tags: ["Payment"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "paymentId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      responses: {
        200: {
          description: "Payment details retrieved.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  payment: { $ref: "#/components/schemas/Payment" }
                }
              }
            }
          }
        },
        404: {
          description: "Payment not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/payment/webhook": {
    post: {
      summary: "Razorpay Webhook listener",
      description: "Receives raw body notifications from Razorpay regarding async transaction updates (e.g. payment authorized, failed). Only accepts request signature headers.",
      tags: ["Payment"],
      security: [],
      responses: {
        200: {
          description: "Webhook processed successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true }
                }
              }
            }
          }
        },
        400: {
          description: "Missing body or invalid signature.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  }
};
