export const restaurantSchemas = {
  Restaurant: {
    type: "object",
    properties: {
      id: { type: "string", example: "60c72b2f9b1d8b0015f2ed64" },
      ownerId: { type: "string", example: "60c72b2f9b1d8b0015f2ed65" },
      name: { type: "string", example: "Tasty Burger Joint" },
      description: { type: "string", example: "The best burgers in town.", nullable: true },
      logo: {
        type: "object",
        nullable: true,
        properties: {
          url: { type: "string", example: "https://res.cloudinary.com/.../logo.jpg" },
          publicId: { type: "string", example: "restaurant/logo_123" }
        }
      },
      banner: {
        type: "object",
        nullable: true,
        properties: {
          url: { type: "string", example: "https://res.cloudinary.com/.../banner.jpg" },
          publicId: { type: "string", example: "restaurant/banner_123" }
        }
      },
      primaryAddressId: { type: "string", example: "60c72b2f9b1d8b0015f2ed66", nullable: true },
      restaurantType: { type: "string", enum: ["VEG", "NON_VEG", "BOTH"], example: "BOTH" },
      cuisineIds: {
        type: "array",
        items: { type: "string" },
        example: ["60c72b2f9b1d8b0015f2ed67"]
      },
      gstNumber: { type: "string", example: "22AAAAA0000A1Z5", nullable: true },
      fssaiLicenseNumber: { type: "string", example: "12345678901234" },
      minimumOrderAmount: { type: "number", example: 100 },
      deliveryRadius: { type: "number", example: 5 },
      averagePreparationTime: { type: "number", example: 25 },
      averageRating: { type: "number", example: 4.5 },
      totalReviews: { type: "integer", example: 120 },
      isOpen: { type: "boolean", example: true },
      isVerified: { type: "boolean", example: true },
      status: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED"], example: "APPROVED" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  CreateRestaurantInput: {
    type: "object",
    required: ["name", "restaurantType", "cuisineIds", "fssaiLicenseNumber", "minimumOrderAmount", "deliveryRadius", "averagePreparationTime"],
    properties: {
      name: { type: "string", example: "Tasty Burger Joint" },
      description: { type: "string", example: "The best burgers in town." },
      restaurantType: { type: "string", enum: ["VEG", "NON_VEG", "BOTH"], example: "BOTH" },
      cuisineIds: {
        type: "array",
        items: { type: "string" },
        example: ["60c72b2f9b1d8b0015f2ed67"]
      },
      gstNumber: { type: "string", example: "22AAAAA0000A1Z5" },
      fssaiLicenseNumber: { type: "string", example: "12345678901234" },
      minimumOrderAmount: { type: "number", example: 100 },
      deliveryRadius: { type: "number", example: 5 },
      averagePreparationTime: { type: "number", example: 25 }
    }
  },
  UpdateRestaurantInput: {
    type: "object",
    properties: {
      name: { type: "string", example: "Tasty Gourmet Burger Joint" },
      description: { type: "string", example: "Gourmet burgers." },
      restaurantType: { type: "string", enum: ["VEG", "NON_VEG", "BOTH"], example: "BOTH" },
      cuisineIds: {
        type: "array",
        items: { type: "string" },
        example: ["60c72b2f9b1d8b0015f2ed67"]
      },
      gstNumber: { type: "string", example: "22AAAAA0000A1Z5" },
      fssaiLicenseNumber: { type: "string", example: "12345678901234" },
      minimumOrderAmount: { type: "number", example: 120 },
      deliveryRadius: { type: "number", example: 6 },
      averagePreparationTime: { type: "number", example: 30 }
    }
  }
};

export const restaurantPaths = {
  "/api/v1/restaurant": {
    post: {
      summary: "Register restaurant details",
      description: "Registers profile details for the authenticated restaurant partner.",
      tags: ["Restaurant"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateRestaurantInput" }
          }
        }
      },
      responses: {
        201: {
          description: "Restaurant profile registered successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Restaurant registered successfully." },
                  restaurant: { $ref: "#/components/schemas/Restaurant" }
                }
              }
            }
          }
        },
        400: {
          description: "Invalid validation info.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } }
        },
        401: {
          description: "Unauthorized.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/restaurant/me": {
    get: {
      summary: "Get my restaurant profile",
      description: "Retrieves the registered profile details of the authenticated restaurant partner.",
      tags: ["Restaurant"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Restaurant details retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  restaurant: { $ref: "#/components/schemas/Restaurant" }
                }
              }
            }
          }
        },
        401: {
          description: "Unauthorized access.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        },
        404: {
          description: "Restaurant not registered yet.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    },
    patch: {
      summary: "Update restaurant profile",
      description: "Updates details of the authenticated restaurant partner's profile.",
      tags: ["Restaurant"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateRestaurantInput" }
          }
        }
      },
      responses: {
        200: {
          description: "Restaurant profile updated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Restaurant details updated successfully." },
                  restaurant: { $ref: "#/components/schemas/Restaurant" }
                }
              }
            }
          }
        },
        400: {
          description: "Invalid validation info.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } }
        },
        404: {
          description: "Restaurant not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/restaurant/open-status": {
    patch: {
      summary: "Toggle open status",
      description: "Toggles whether the restaurant is currently accepting orders (isOpen true/false).",
      tags: ["Restaurant"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["isOpen"],
              properties: {
                isOpen: { type: "boolean", example: true }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Open status toggled successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Restaurant status updated successfully." },
                  restaurant: { $ref: "#/components/schemas/Restaurant" }
                }
              }
            }
          }
        },
        404: {
          description: "Restaurant not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/restaurant/logo": {
    patch: {
      summary: "Upload restaurant logo",
      description: "Uploads an image file (multipart/form-data) to set/update the restaurant's logo.",
      tags: ["Restaurant"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["logo"],
              properties: {
                logo: {
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
          description: "Logo uploaded successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Logo uploaded successfully." },
                  logo: {
                    type: "object",
                    properties: {
                      url: { type: "string", example: "https://res.cloudinary.com/.../logo.jpg" },
                      publicId: { type: "string", example: "restaurant/logo_123" }
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
  "/api/v1/restaurant/banner": {
    patch: {
      summary: "Upload restaurant banner",
      description: "Uploads an image file (multipart/form-data) to set/update the restaurant's banner image.",
      tags: ["Restaurant"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["banner"],
              properties: {
                banner: {
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
          description: "Banner uploaded successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Banner uploaded successfully." },
                  banner: {
                    type: "object",
                    properties: {
                      url: { type: "string", example: "https://res.cloudinary.com/.../banner.jpg" },
                      publicId: { type: "string", example: "restaurant/banner_123" }
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
  }
};
