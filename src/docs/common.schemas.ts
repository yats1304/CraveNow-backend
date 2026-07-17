export const commonSchemas = {
  ApiResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Operation succeeded." },
      data: { type: "object", nullable: true },
    },
  },
  ValidationError: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Validation failed." },
      errors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            field: { type: "string", example: "email" },
            message: { type: "string", example: "Invalid email format." },
          },
        },
      },
    },
  },
  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Resource not found or unauthorized access." },
    },
  },
  Pagination: {
    type: "object",
    properties: {
      page: { type: "integer", example: 1 },
      limit: { type: "integer", example: 10 },
      total: { type: "integer", example: 45 },
      totalPages: { type: "integer", example: 5 },
    },
  },
};
