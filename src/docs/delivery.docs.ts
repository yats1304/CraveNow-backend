export const deliverySchemas = {
  Delivery: {
    type: "object",
    properties: {
      id: { type: "string", example: "60c72b2f9b1d8b0015f2ed64" },
      orderId: { type: "string", example: "60c72b2f9b1d8b0015f2ed65" },
      deliveryPartnerId: { type: "string", example: "60c72b2f9b1d8b0015f2ed66" },
      status: { type: "string", enum: ["ASSIGNED", "ACCEPTED", "REACHED_PICKUP", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"], example: "ASSIGNED" },
      assignedAt: { type: "string", format: "date-time" },
      assignmentExpiresAt: { type: "string", format: "date-time" },
      reassignmentCount: { type: "integer", example: 0 },
      acceptedAt: { type: "string", format: "date-time", nullable: true },
      reachedPickupAt: { type: "string", format: "date-time", nullable: true },
      pickedUpAt: { type: "string", format: "date-time", nullable: true },
      outForDeliveryAt: { type: "string", format: "date-time", nullable: true },
      deliveredAt: { type: "string", format: "date-time", nullable: true },
      cancelledAt: { type: "string", format: "date-time", nullable: true },
      estimatedPickupTime: { type: "string", format: "date-time", nullable: true },
      estimatedDeliveryTime: { type: "string", format: "date-time", nullable: true },
      notes: { type: "string", example: "Leave at reception.", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  DeliveryPartner: {
    type: "object",
    properties: {
      id: { type: "string", example: "60c72b2f9b1d8b0015f2ed67" },
      userId: { type: "string", example: "60c72b2f9b1d8b0015f2ed68" },
      vehicleType: { type: "string", enum: ["CYCLE", "BIKE", "SCOOTER"], example: "BIKE" },
      vehicleNumber: { type: "string", example: "MH12AB1234" },
      drivingLicenseNumber: { type: "string", example: "DL-1234567890123" },
      availabilityStatus: { type: "string", enum: ["ONLINE", "OFFLINE", "IN_DELIVERY"], example: "ONLINE" },
      isVerified: { type: "boolean", example: true },
      isActive: { type: "boolean", example: true },
      rating: { type: "number", example: 4.8 },
      totalRatings: { type: "integer", example: 42 },
      totalDeliveries: { type: "integer", example: 150 },
      totalEarnings: { type: "number", example: 7500 },
      successfulDeliveries: { type: "integer", example: 148 },
      cancelledDeliveries: { type: "integer", example: 2 },
      acceptanceRate: { type: "number", example: 98 },
      completionRate: { type: "number", example: 99 },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  RegisterDeliveryPartnerInput: {
    type: "object",
    required: ["vehicleType", "vehicleNumber", "drivingLicenseNumber"],
    properties: {
      vehicleType: { type: "string", enum: ["CYCLE", "BIKE", "SCOOTER"], example: "BIKE" },
      vehicleNumber: { type: "string", example: "MH12AB1234" },
      drivingLicenseNumber: { type: "string", example: "DL-1234567890123" }
    }
  },
  UpdateDeliveryPartnerInput: {
    type: "object",
    properties: {
      vehicleType: { type: "string", enum: ["CYCLE", "BIKE", "SCOOTER"], example: "SCOOTER" },
      vehicleNumber: { type: "string", example: "MH12CD5678" },
      drivingLicenseNumber: { type: "string", example: "DL-9876543210987" }
    }
  },
  UpdateAvailabilityInput: {
    type: "object",
    required: ["availabilityStatus"],
    properties: {
      availabilityStatus: { type: "string", enum: ["ONLINE", "OFFLINE"], example: "ONLINE" }
    }
  },
  UpdateLocationInput: {
    type: "object",
    required: ["latitude", "longitude"],
    properties: {
      latitude: { type: "number", example: 18.5204 },
      longitude: { type: "number", example: 73.8567 }
    }
  },
  AssignRiderInput: {
    type: "object",
    required: ["riderId"],
    properties: {
      riderId: { type: "string", example: "60c72b2f9b1d8b0015f2ed66" }
    }
  }
};

export const deliveryPaths = {
  "/api/v1/delivery-partner/register": {
    post: {
      summary: "Register delivery partner details",
      description: "Registers vehicle details and license information for the authenticated driver.",
      tags: ["Delivery Partner"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RegisterDeliveryPartnerInput" }
          }
        }
      },
      responses: {
        201: {
          description: "Delivery partner registered successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Delivery partner registered successfully." },
                  deliveryPartner: { $ref: "#/components/schemas/DeliveryPartner" }
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
          description: "Unauthorized.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    }
  },
  "/api/v1/delivery-partner/me": {
    get: {
      summary: "Get my rider profile",
      description: "Retrieves vehicle and verification status of the authenticated delivery partner.",
      tags: ["Delivery Partner"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Rider profile retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  profile: { $ref: "#/components/schemas/DeliveryPartner" }
                }
              }
            }
          }
        },
        404: {
          description: "Profile not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
        }
      }
    },
    patch: {
      summary: "Update rider profile",
      description: "Updates vehicle details for the authenticated delivery partner.",
      tags: ["Delivery Partner"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateDeliveryPartnerInput" }
          }
        }
      },
      responses: {
        200: {
          description: "Rider profile updated.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Profile updated successfully." },
                  deliveryPartner: { $ref: "#/components/schemas/DeliveryPartner" }
                }
              }
            }
          }
        }
      }
    }
  },
  "/api/v1/delivery-partner/availability": {
    patch: {
      summary: "Update availability status",
      description: "Toggles the rider availability status (ONLINE/OFFLINE) for order notifications.",
      tags: ["Delivery Partner"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateAvailabilityInput" }
          }
        }
      },
      responses: {
        200: {
          description: "Availability status updated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Availability updated successfully." },
                  deliveryPartner: { $ref: "#/components/schemas/DeliveryPartner" }
                }
              }
            }
          }
        }
      }
    }
  },
  "/api/v1/delivery-partner/location": {
    patch: {
      summary: "Update rider geolocation",
      description: "Updates the current coordinate tracking location of the active driver (lat/lng).",
      tags: ["Delivery Partner"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateLocationInput" }
          }
        }
      },
      responses: {
        200: {
          description: "Rider location updated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Location updated successfully." }
                }
              }
            }
          }
        }
      }
    }
  },
  "/api/v1/delivery-partner/orders": {
    get: {
      summary: "Get assigned deliveries list",
      description: "Retrieves list of active/completed delivery tasks assigned to the authenticated rider.",
      tags: ["Delivery Partner"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Assigned deliveries retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  deliveries: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Delivery" }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "/api/v1/order/{orderId}/assign-rider": {
    patch: {
      summary: "Assign rider to order",
      description: "Manually assigns a specific delivery partner to an order (Restaurant operation).",
      tags: ["Delivery Transitions"],
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
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AssignRiderInput" }
          }
        }
      },
      responses: {
        200: {
          description: "Rider assigned and delivery session initiated.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Rider assigned successfully." },
                  delivery: { $ref: "#/components/schemas/Delivery" }
                }
              }
            }
          }
        }
      }
    }
  },
  "/api/v1/order/{deliveryId}/accept": {
    patch: {
      summary: "Accept delivery assignment",
      description: "Invoked by the driver to accept the assigned delivery task.",
      tags: ["Delivery Transitions"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "deliveryId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      responses: {
        200: {
          description: "Delivery accepted.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Delivery accepted successfully." },
                  delivery: { $ref: "#/components/schemas/Delivery" }
                }
              }
            }
          }
        }
      }
    }
  },
  "/api/v1/order/{deliveryId}/reach-pickup": {
    patch: {
      summary: "Rider reached restaurant pickup location",
      description: "Marks that the driver has arrived at the restaurant location.",
      tags: ["Delivery Transitions"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "deliveryId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      responses: {
        200: {
          description: "Status transitioned to reached pickup.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Status updated to reached pickup." },
                  delivery: { $ref: "#/components/schemas/Delivery" }
                }
              }
            }
          }
        }
      }
    }
  },
  "/api/v1/order/{deliveryId}/picked-up": {
    patch: {
      summary: "Rider picked up order package",
      description: "Transition order state as picked up and on route for delivery.",
      tags: ["Delivery Transitions"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "deliveryId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      responses: {
        200: {
          description: "Status transitioned to picked up.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Order picked up successfully." },
                  delivery: { $ref: "#/components/schemas/Delivery" }
                }
              }
            }
          }
        }
      }
    }
  },
  "/api/v1/order/{deliveryId}/out-for-delivery": {
    patch: {
      summary: "Status transitioned to out for delivery",
      description: "Marks the active order as out for delivery.",
      tags: ["Delivery Transitions"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "deliveryId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      responses: {
        200: {
          description: "Status transitioned to out for delivery.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Status updated to out for delivery." },
                  delivery: { $ref: "#/components/schemas/Delivery" }
                }
              }
            }
          }
        }
      }
    }
  },
  "/api/v1/order/{deliveryId}/delivered": {
    patch: {
      summary: "Rider delivered package successfully",
      description: "Completes the order journey by setting states to delivered.",
      tags: ["Delivery Transitions"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "deliveryId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "60c72b2f9b1d8b0015f2ed64"
        }
      ],
      responses: {
        200: {
          description: "Status transitioned to delivered.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Order delivered successfully." },
                  delivery: { $ref: "#/components/schemas/Delivery" }
                }
              }
            }
          }
        }
      }
    }
  }
};
