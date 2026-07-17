export const userSchemas = {
  User: {
    type: "object",
    properties: {
      id: { type: "string", example: "60c72b2f9b1d8b0015f2ed64" },
      name: { type: "string", example: "John Doe" },
      email: { type: "string", format: "email", example: "john@example.com" },
      phone: { type: "string", example: "+1234567890", nullable: true },
      avatar: { type: "string", example: "https://res.cloudinary.com/.../avatar.png", nullable: true },
      role: { type: "string", enum: ["CUSTOMER", "RESTAURANT", "DELIVERY_PARTNER", "ADMIN"], example: "CUSTOMER" },
      status: { type: "string", enum: ["ACTIVE", "BLOCKED"], example: "ACTIVE" },
      totalOrders: { type: "integer", example: 15 },
      lastOrderDate: { type: "string", format: "date-time", nullable: true },
      lifetimeSpend: { type: "number", example: 349.5 },
      averageOrderValue: { type: "number", example: 23.3 },
      createdAt: { type: "string", format: "date-time", example: "2026-07-17T12:00:00Z" },
      updatedAt: { type: "string", format: "date-time", example: "2026-07-17T12:00:00Z" },
    },
  },
};

export const userPaths = {
  "/api/v1/auth/me": {
    get: {
      summary: "Get current user profile",
      description: "Retrieves the authenticated user's profile information using the JWT access token.",
      tags: ["User Profile"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Profile information retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "User profile retrieved successfully." },
                  data: { $ref: "#/components/schemas/User" },
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
};
