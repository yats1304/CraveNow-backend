export const cartSchemas = {
  Cart: {
    type: "object",
    properties: {
      id: { type: "string", example: "60c72b2f9b1d8b0015f2ed64" },
      userId: { type: "string", example: "60c72b2f9b1d8b0015f2ed65" },
      restaurantId: { type: "string", example: "60c72b2f9b1d8b0015f2ed66", nullable: true },
      subtotal: { type: "number", example: 270 },
      discount: { type: "number", example: 0 },
      tax: { type: "number", example: 13.5 },
      total: { type: "number", example: 283.5 },
      items: {
        type: "array",
        items: { $ref: "#/components/schemas/CartItem" }
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  CartItem: {
    type: "object",
    properties: {
      id: { type: "string", example: "60c72b2f9b1d8b0015f2ed67" },
      cartId: { type: "string", example: "60c72b2f9b1d8b0015f2ed64" },
      menuItemId: { $ref: "#/components/schemas/MenuItem" },
      quantity: { type: "integer", example: 2 },
      unitPriceSnapshot: { type: "number", example: 135 },
      specialInstructions: { type: "string", example: "No onions, please.", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  AddToCartInput: {
    type: "object",
    required: ["menuItemId", "quantity"],
    properties: {
      menuItemId: { type: "string", example: "60c72b2f9b1d8b0015f2ed68" },
      quantity: { type: "integer", minimum: 1, example: 2 },
      specialInstructions: { type: "string", example: "No onions, please." }
    }
  },
  UpdateCartItemInput: {
    type: "object",
    required: ["quantity"],
    properties: {
      quantity: { type: "integer", minimum: 1, example: 3 },
      specialInstructions: { type: "string", example: "Extra cheese, please." }
    }
  }
};

export const cartPaths = {
  "/api/v1/cart": {
    post: {
      summary: "Add item to cart",
      description: "Adds a menu item to the authenticated customer's shopping cart. Automatically calculates cart totals. If adding an item from a different restaurant, it may reject or replace depending on business rules.",
      tags: ["Cart"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AddToCartInput" }
          }
        }
      },
      responses: {
        200: {
          description: "Item added to cart successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Item added to cart successfully." },
                  cart: { $ref: "#/components/schemas/Cart" }
                }
              }
            }
          }
        },
        400: {
          description: "Validation error or invalid menu item.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } }
        },
        401: {
          description: "Unauthorized access.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    },
    get: {
      summary: "Get my cart",
      description: "Retrieves the authenticated customer's current shopping cart details, including active items.",
      tags: ["Cart"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Cart retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  cart: { $ref: "#/components/schemas/Cart" }
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
    },
    delete: {
      summary: "Clear my cart",
      description: "Removes all items from the authenticated customer's shopping cart and resets totals.",
      tags: ["Cart"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Cart cleared successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Cart cleared successfully." }
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
  "/api/v1/cart/items/{cartItemId}": {
    patch: {
      summary: "Update cart item quantity",
      description: "Updates the quantity and instructions for a specific item inside the customer's cart.",
      tags: ["Cart"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "cartItemId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed67"
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateCartItemInput" }
          }
        }
      },
      responses: {
        200: {
          description: "Cart item updated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Cart item updated successfully." },
                  cart: { $ref: "#/components/schemas/Cart" }
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
          description: "Cart item not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    },
    delete: {
      summary: "Remove item from cart",
      description: "Removes a specific menu item completely from the authenticated user's cart.",
      tags: ["Cart"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "cartItemId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed67"
        }
      ],
      responses: {
        200: {
          description: "Item removed from cart successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Item removed from cart successfully." },
                  cart: { $ref: "#/components/schemas/Cart" }
                }
              }
            }
          }
        },
        404: {
          description: "Cart item not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  }
};
