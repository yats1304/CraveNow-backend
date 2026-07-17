export const authSchemas = {
  RegisterInput: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: { type: "string", example: "John Doe" },
      email: { type: "string", format: "email", example: "john@example.com" },
      password: { type: "string", format: "password", example: "password123" },
      phone: { type: "string", example: "+1234567890" },
      role: { type: "string", enum: ["CUSTOMER", "RESTAURANT", "DELIVERY_PARTNER"], default: "CUSTOMER", example: "CUSTOMER" },
    },
  },
  VerifyOtpInput: {
    type: "object",
    required: ["email", "otp", "deviceId"],
    properties: {
      email: { type: "string", format: "email", example: "john@example.com" },
      otp: { type: "string", example: "123456" },
      deviceId: { type: "string", example: "device-uuid-123" },
    },
  },
  LoginInput: {
    type: "object",
    required: ["email", "password", "deviceId"],
    properties: {
      email: { type: "string", format: "email", example: "john@example.com" },
      password: { type: "string", format: "password", example: "password123" },
      deviceId: { type: "string", example: "device-uuid-123" },
    },
  },
  ResendOtpInput: {
    type: "object",
    required: ["email"],
    properties: {
      email: { type: "string", format: "email", example: "john@example.com" },
    },
  },
  ForgotPasswordInput: {
    type: "object",
    required: ["email"],
    properties: {
      email: { type: "string", format: "email", example: "john@example.com" },
    },
  },
  ResetPasswordInput: {
    type: "object",
    required: ["email", "otp", "password"],
    properties: {
      email: { type: "string", format: "email", example: "john@example.com" },
      otp: { type: "string", example: "123456" },
      password: { type: "string", format: "password", example: "newSecurePassword123" },
    },
  },
  ChangePasswordInput: {
    type: "object",
    required: ["currentPassword", "newPassword", "deviceId"],
    properties: {
      currentPassword: { type: "string", format: "password", example: "oldPassword123" },
      newPassword: { type: "string", format: "password", example: "newSecurePassword123" },
      deviceId: { type: "string", example: "device-uuid-123" },
    },
  },
  GoogleLoginInput: {
    type: "object",
    required: ["idToken", "deviceId"],
    properties: {
      idToken: { type: "string", example: "google-oauth2-id-token" },
      deviceId: { type: "string", example: "device-uuid-123" },
    },
  },
  AuthResponseData: {
    type: "object",
    properties: {
      user: { $ref: "#/components/schemas/User" },
      tokens: {
        type: "object",
        properties: {
          accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
        },
      },
    },
  },
};

export const authPaths = {
  "/api/v1/auth/register": {
    post: {
      summary: "Register a new user",
      description: "Registers a new user account (CUSTOMER, RESTAURANT, or DELIVERY_PARTNER) and triggers an OTP email for account verification.",
      tags: ["Authentication"],
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RegisterInput" },
          },
        },
      },
      responses: {
        201: {
          description: "User registered successfully. Check email for verification OTP.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Registration successful. Please check your email for the verification code." },
                },
              },
            },
          },
        },
        400: {
          description: "Validation error or bad request.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } },
        },
        409: {
          description: "User with this email already exists.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        500: {
          description: "Internal Server Error.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },
  "/api/v1/auth/verify-otp": {
    post: {
      summary: "Verify account OTP",
      description: "Verifies the registration or sign-in OTP code sent to the user's email, activating the account and returning JWT tokens.",
      tags: ["Authentication"],
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/VerifyOtpInput" },
          },
        },
      },
      responses: {
        200: {
          description: "OTP verified successfully. Tokens generated.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "OTP verified successfully." },
                  data: { $ref: "#/components/schemas/AuthResponseData" },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid OTP code or expired validation.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        404: {
          description: "User or device session not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },
  "/api/v1/auth/login": {
    post: {
      summary: "User login",
      description: "Logs in a user with email and password. Generates and returns an access/refresh token pair.",
      tags: ["Authentication"],
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/LoginInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Login successful. JWT tokens returned.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Login successful." },
                  data: { $ref: "#/components/schemas/AuthResponseData" },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid login credentials or request.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        401: {
          description: "Unauthorized access or pending account verification.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        403: {
          description: "Account is blocked or suspended.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },
  "/api/v1/auth/resend-otp": {
    post: {
      summary: "Resend verification OTP",
      description: "Resends a new verification OTP to the user's registered email address.",
      tags: ["Authentication"],
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ResendOtpInput" },
          },
        },
      },
      responses: {
        200: {
          description: "OTP resent successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Verification code sent to your email." },
                },
              },
            },
          },
        },
        404: {
          description: "User with this email not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },
  "/api/v1/auth/forgot-password": {
    post: {
      summary: "Request password reset",
      description: "Initiates the forgot-password flow by sending a reset OTP code to the user's email address.",
      tags: ["Authentication"],
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ForgotPasswordInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Reset code dispatched to email.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Password reset OTP sent to your email." },
                },
              },
            },
          },
        },
        404: {
          description: "User not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },
  "/api/v1/auth/reset-password": {
    post: {
      summary: "Reset user password",
      description: "Completes the forgot-password flow by providing the verification OTP code and the new password.",
      tags: ["Authentication"],
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ResetPasswordInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Password reset successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Password reset successful." },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid or expired OTP code.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },
  "/api/v1/auth/refresh": {
    post: {
      summary: "Refresh access token",
      description: "Generates a new short-lived access token using a valid, unexpired refresh token stored in cookie.",
      tags: ["Authentication"],
      security: [],
      responses: {
        200: {
          description: "Access token refreshed successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Token refreshed successfully." },
                  data: {
                    type: "object",
                    properties: {
                      accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Refresh token is missing, invalid, or expired.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },
  "/api/v1/auth/logout": {
    post: {
      summary: "Logout user",
      description: "Blacklists or clears the active token and session on the server and expires client credentials.",
      tags: ["Authentication"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["deviceId"],
              properties: {
                deviceId: { type: "string", example: "device-uuid-123" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Logged out successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Logged out successfully." },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized session access.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },
  "/api/v1/auth/google": {
    post: {
      summary: "Google OAuth sign-in",
      description: "Logs in or registers a user automatically through a Google ID OAuth token verification.",
      tags: ["Authentication"],
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/GoogleLoginInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Google login successful.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Login successful." },
                  data: { $ref: "#/components/schemas/AuthResponseData" },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid Google token.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },
  "/api/v1/auth/change-password": {
    post: {
      summary: "Change account password",
      description: "Changes the authenticated user's password after validating their current password.",
      tags: ["Authentication"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ChangePasswordInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Password updated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Password changed successfully." },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid current password or new password restrictions.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        401: {
          description: "User is unauthorized.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
  },
};
