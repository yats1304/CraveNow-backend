export const menuSchemas = {
  MenuItem: {
    type: "object",
    properties: {
      id: { type: "string", example: "60c72b2f9b1d8b0015f2ed64" },
      restaurantId: { type: "string", example: "60c72b2f9b1d8b0015f2ed65" },
      categoryId: { type: "string", example: "60c72b2f9b1d8b0015f2ed66" },
      name: { type: "string", example: "Cheeseburger" },
      slug: { type: "string", example: "cheeseburger" },
      description: { type: "string", example: "Juicy beef patty with melted cheese.", nullable: true },
      tags: {
        type: "array",
        items: { type: "string" },
        example: ["burger", "fastfood"]
      },
      images: {
        type: "array",
        items: {
          type: "object",
          properties: {
            url: { type: "string", example: "https://res.cloudinary.com/.../burger.jpg" },
            publicId: { type: "string", example: "menu/burger_123" }
          }
        }
      },
      price: { type: "number", example: 150 },
      discountPercentage: { type: "number", example: 10 },
      finalPrice: { type: "number", example: 135 },
      foodType: { type: "string", enum: ["VEG", "NON_VEG"], example: "NON_VEG" },
      preparationTime: { type: "number", example: 15 },
      isAvailable: { type: "boolean", example: true },
      isFeatured: { type: "boolean", example: false },
      totalOrders: { type: "integer", example: 450 },
      isDeleted: { type: "boolean", example: false },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  CreateMenuItemInput: {
    type: "object",
    required: ["name", "price", "foodType", "preparationTime"],
    properties: {
      name: { type: "string", example: "Cheeseburger" },
      description: { type: "string", example: "Juicy beef patty with melted cheese." },
      price: { type: "number", example: 150 },
      discountPercentage: { type: "number", example: 10 },
      foodType: { type: "string", enum: ["VEG", "NON_VEG"], example: "NON_VEG" },
      preparationTime: { type: "number", example: 15 },
      isFeatured: { type: "boolean", example: false },
      tags: {
        type: "array",
        items: { type: "string" },
        example: ["burger", "fastfood"]
      }
    }
  },
  UpdateMenuItemInput: {
    type: "object",
    properties: {
      name: { type: "string", example: "Double Cheeseburger" },
      description: { type: "string", example: "Two beef patties." },
      price: { type: "number", example: 220 },
      discountPercentage: { type: "number", example: 5 },
      foodType: { type: "string", enum: ["VEG", "NON_VEG"], example: "NON_VEG" },
      preparationTime: { type: "number", example: 18 },
      isFeatured: { type: "boolean", example: true },
      tags: {
        type: "array",
        items: { type: "string" },
        example: ["burger", "double"]
      }
    }
  }
};

export const menuPaths = {
  "/api/v1/menu-item/{categoryId}": {
    post: {
      summary: "Create a menu item",
      description: "Registers a new menu item under a specific category in the authenticated partner's restaurant.",
      tags: ["Menu Item"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "categoryId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed66"
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateMenuItemInput" }
          }
        }
      },
      responses: {
        201: {
          description: "Menu item created successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Menu item created successfully." },
                  menuItem: { $ref: "#/components/schemas/MenuItem" }
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
    }
  },
  "/api/v1/menu-item": {
    get: {
      summary: "List restaurant menu items",
      description: "Retrieves a paginated list of menu items registered for the authenticated restaurant.",
      tags: ["Menu Item"],
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
          name: "search",
          in: "query",
          required: false,
          schema: { type: "string" },
          example: "Burger"
        },
        {
          name: "foodType",
          in: "query",
          required: false,
          schema: { type: "string", enum: ["VEG", "NON_VEG"] },
          example: "NON_VEG"
        },
        {
          name: "categoryId",
          in: "query",
          required: false,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed66"
        }
      ],
      responses: {
        200: {
          description: "Menu items list retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  menuItems: {
                    type: "array",
                    items: { $ref: "#/components/schemas/MenuItem" }
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
  "/api/v1/menu-item/{menuItemId}": {
    get: {
      summary: "Get menu item by ID",
      description: "Retrieves the details of a specific menu item within the authenticated restaurant.",
      tags: ["Menu Item"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "menuItemId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      responses: {
        200: {
          description: "Menu item details retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  menuItem: { $ref: "#/components/schemas/MenuItem" }
                }
              }
            }
          }
        },
        404: {
          description: "Menu item not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    },
    patch: {
      summary: "Update menu item details",
      description: "Updates the fields of an existing menu item.",
      tags: ["Menu Item"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "menuItemId",
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
            schema: { $ref: "#/components/schemas/UpdateMenuItemInput" }
          }
        }
      },
      responses: {
        200: {
          description: "Menu item updated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Menu item updated successfully." },
                  menuItem: { $ref: "#/components/schemas/MenuItem" }
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
          description: "Menu item not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    },
    delete: {
      summary: "Soft-delete menu item",
      description: "Flags a specific menu item as deleted (sets isDeleted to true).",
      tags: ["Menu Item"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "menuItemId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      responses: {
        200: {
          description: "Menu item deleted successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Menu item deleted successfully." }
                }
              }
            }
          }
        },
        404: {
          description: "Menu item not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/menu-item/{menuItemId}/images": {
    patch: {
      summary: "Upload menu item images",
      description: "Uploads multiple image files (multipart/form-data, max 5) to set/update the menu item's gallery.",
      tags: ["Menu Item"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "menuItemId",
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
              required: ["images"],
              properties: {
                images: {
                  type: "array",
                  items: {
                    type: "string",
                    format: "binary"
                  },
                  description: "List of files to upload (Max 5 images)"
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Images uploaded successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Images uploaded successfully." },
                  images: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        url: { type: "string", example: "https://res.cloudinary.com/.../burger.jpg" },
                        publicId: { type: "string", example: "menu/burger_123" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: "Invalid validation or files parameters.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/menu-item/{menuItemId}/availability": {
    patch: {
      summary: "Update menu item availability status",
      description: "Toggles whether this menu item is currently available for order.",
      tags: ["Menu Item"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "menuItemId",
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
              required: ["isAvailable"],
              properties: {
                isAvailable: { type: "boolean", example: false }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Availability status updated.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Menu item availability updated successfully." },
                  menuItem: { $ref: "#/components/schemas/MenuItem" }
                }
              }
            }
          }
        },
        404: {
          description: "Menu item not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  }
};
