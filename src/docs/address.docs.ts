export const addressSchemas = {
  Address: {
    type: "object",
    properties: {
      id: { type: "string", example: "60c72b2f9b1d8b0015f2ed64" },
      userId: { type: "string", example: "60c72b2f9b1d8b0015f2ed65" },
      ownerType: { type: "string", enum: ["USER", "RESTAURANT"], example: "USER" },
      label: { type: "string", enum: ["HOME", "WORK", "OTHER"], example: "HOME" },
      fullName: { type: "string", example: "John Doe" },
      phone: { type: "string", example: "+1234567890" },
      addressLine1: { type: "string", example: "123 Main St" },
      addressLine2: { type: "string", example: "Apt 4B", nullable: true },
      landmark: { type: "string", example: "Near Central Park", nullable: true },
      city: { type: "string", example: "New York" },
      state: { type: "string", example: "NY" },
      country: { type: "string", example: "USA" },
      postalCode: { type: "string", example: "10001" },
      location: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["Point"], example: "Point" },
          coordinates: {
            type: "array",
            items: { type: "number" },
            minItems: 2,
            maxItems: 2,
            example: [-73.935242, 40.73061]
          }
        }
      },
      isDefault: { type: "boolean", example: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  CreateAddressInput: {
    type: "object",
    required: ["label", "fullName", "phone", "addressLine1", "city", "state", "country", "postalCode", "latitude", "longitude"],
    properties: {
      label: { type: "string", enum: ["HOME", "WORK", "OTHER"], example: "HOME" },
      fullName: { type: "string", example: "John Doe" },
      phone: { type: "string", example: "+1234567890" },
      addressLine1: { type: "string", example: "123 Main St" },
      addressLine2: { type: "string", example: "Apt 4B" },
      landmark: { type: "string", example: "Near Central Park" },
      city: { type: "string", example: "New York" },
      state: { type: "string", example: "NY" },
      country: { type: "string", example: "USA" },
      postalCode: { type: "string", example: "10001" },
      latitude: { type: "number", example: 40.73061 },
      longitude: { type: "number", example: -73.935242 },
    }
  },
  UpdateAddressInput: {
    type: "object",
    properties: {
      label: { type: "string", enum: ["HOME", "WORK", "OTHER"], example: "WORK" },
      fullName: { type: "string", example: "John Doe Jr" },
      phone: { type: "string", example: "+1234567890" },
      addressLine1: { type: "string", example: "456 Park Ave" },
      addressLine2: { type: "string", example: "Fl 3" },
      landmark: { type: "string", example: "Opposite High School" },
      city: { type: "string", example: "New York" },
      state: { type: "string", example: "NY" },
      country: { type: "string", example: "USA" },
      postalCode: { type: "string", example: "10022" },
      latitude: { type: "number", example: 40.7614 },
      longitude: { type: "number", example: -73.9718 },
    }
  }
};

export const addressPaths = {
  "/api/v1/address": {
    post: {
      summary: "Create a new address",
      description: "Registers a new delivery address for the authenticated user.",
      tags: ["Address"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateAddressInput" }
          }
        }
      },
      responses: {
        201: {
          description: "Address created successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Address created successfully." },
                  address: { $ref: "#/components/schemas/Address" }
                }
              }
            }
          }
        },
        400: {
          description: "Validation or request error.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } }
        },
        401: {
          description: "Unauthorized.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    },
    get: {
      summary: "Get my addresses",
      description: "Retrieves all saved addresses for the authenticated user.",
      tags: ["Address"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Addresses retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  addresses: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Address" }
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
  "/api/v1/address/{addressId}": {
    get: {
      summary: "Get address by ID",
      description: "Retrieves the details of a specific address by its database ID.",
      tags: ["Address"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "addressId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      responses: {
        200: {
          description: "Address details retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  address: { $ref: "#/components/schemas/Address" }
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
          description: "Address not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    },
    put: {
      summary: "Update address details",
      description: "Updates details of an existing address for the authenticated user.",
      tags: ["Address"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "addressId",
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
            schema: { $ref: "#/components/schemas/UpdateAddressInput" }
          }
        }
      },
      responses: {
        200: {
          description: "Address updated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Address updated successfully." },
                  address: { $ref: "#/components/schemas/Address" }
                }
              }
            }
          }
        },
        400: {
          description: "Invalid validation data.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } }
        },
        404: {
          description: "Address not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    },
    delete: {
      summary: "Delete an address",
      description: "Deletes a saved address from the user's account.",
      tags: ["Address"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "addressId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      responses: {
        200: {
          description: "Address deleted successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Address deleted successfully." }
                }
              }
            }
          }
        },
        404: {
          description: "Address not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/address/{addressId}/default": {
    put: {
      summary: "Set default address",
      description: "Marks a specific address as the default delivery location for the user.",
      tags: ["Address"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "addressId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      responses: {
        200: {
          description: "Address marked as default.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Address set as default successfully." },
                  address: { $ref: "#/components/schemas/Address" }
                }
              }
            }
          }
        },
        404: {
          description: "Address not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  }
};
