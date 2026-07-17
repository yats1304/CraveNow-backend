export const categorySchemas = {
  Category: {
    type: "object",
    properties: {
      id: { type: "string", example: "60c72b2f9b1d8b0015f2ed64" },
      restaurantId: { type: "string", example: "60c72b2f9b1d8b0015f2ed65" },
      name: { type: "string", example: "Beverages" },
      slug: { type: "string", example: "beverages" },
      description: { type: "string", example: "Cold and hot drinks.", nullable: true },
      image: {
        type: "object",
        nullable: true,
        properties: {
          url: { type: "string", example: "https://res.cloudinary.com/.../beverages.jpg" },
          publicId: { type: "string", example: "category/beverages_123" }
        }
      },
      isActive: { type: "boolean", example: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  CreateCategoryInput: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string", example: "Beverages" },
      description: { type: "string", example: "Cold and hot drinks." }
    }
  },
  UpdateCategoryInput: {
    type: "object",
    properties: {
      name: { type: "string", example: "Soft Drinks" },
      description: { type: "string", example: "Cold fizzy drinks." }
    }
  }
};

export const categoryPaths = {
  "/api/v1/category": {
    post: {
      summary: "Create a category",
      description: "Creates a new category for menu organization within the authenticated partner's restaurant.",
      tags: ["Category"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateCategoryInput" }
          }
        }
      },
      responses: {
        201: {
          description: "Category created successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Category created successfully." },
                  category: { $ref: "#/components/schemas/Category" }
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
        }
      }
    },
    get: {
      summary: "List all categories",
      description: "Retrieves all categories associated with the authenticated restaurant.",
      tags: ["Category"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "search",
          in: "query",
          required: false,
          schema: { type: "string" },
          example: "Beverages"
        },
        {
          name: "isActive",
          in: "query",
          required: false,
          schema: { type: "string", enum: ["true", "false"] },
          example: "true"
        }
      ],
      responses: {
        200: {
          description: "Categories retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  categories: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Category" }
                  }
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
  "/api/v1/category/{categoryId}": {
    get: {
      summary: "Get category by ID",
      description: "Retrieves the details of a specific category within the authenticated restaurant.",
      tags: ["Category"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "categoryId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      responses: {
        200: {
          description: "Category retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  category: { $ref: "#/components/schemas/Category" }
                }
              }
            }
          }
        },
        404: {
          description: "Category not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    },
    patch: {
      summary: "Update category details",
      description: "Updates details of an existing category.",
      tags: ["Category"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "categoryId",
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
            schema: { $ref: "#/components/schemas/UpdateCategoryInput" }
          }
        }
      },
      responses: {
        200: {
          description: "Category updated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Category updated successfully." },
                  category: { $ref: "#/components/schemas/Category" }
                }
              }
            }
          }
        },
        400: {
          description: "Validation error.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } }
        },
        404: {
          description: "Category not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    },
    delete: {
      summary: "Delete a category",
      description: "Deletes a category from the restaurant. Menu items associated with this category should be handled separately.",
      tags: ["Category"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "categoryId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      responses: {
        200: {
          description: "Category deleted successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Category deleted successfully." }
                }
              }
            }
          }
        },
        404: {
          description: "Category not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/category/{categoryId}/image": {
    patch: {
      summary: "Upload category image",
      description: "Uploads an image file (multipart/form-data) to set/update the category's banner image.",
      tags: ["Category"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "categoryId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["image"],
              properties: {
                image: {
                  type: "string",
                  format: "binary",
                  description: "Image file to upload (JPEG, PNG, etc)"
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Category image uploaded successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Category image uploaded successfully." },
                  image: {
                    type: "object",
                    properties: {
                      url: { type: "string", example: "https://res.cloudinary.com/.../beverages.jpg" },
                      publicId: { type: "string", example: "category/beverages_123" }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: "Invalid file or parameters.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/category/{categoryId}/status": {
    patch: {
      summary: "Toggle category active status",
      description: "Toggles whether this category is active (visible to customers).",
      tags: ["Category"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "categoryId",
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
            schema: {
              type: "object",
              required: ["isActive"],
              properties: {
                isActive: { type: "boolean", example: false }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Category active status updated.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Category status updated successfully." },
                  category: { $ref: "#/components/schemas/Category" }
                }
              }
            }
          }
        },
        404: {
          description: "Category not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  }
};
