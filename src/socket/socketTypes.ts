import { DefaultEventsMap } from "socket.io";
import { DeliveryStatus } from "../types/index.js";

/**
 * Events emitted from the client to the server.
 */
export interface ClientToServerEvents {
  ping: () => void;

  joinCustomerRoom: (userId: string) => void;

  joinRestaurantRoom: (restaurantId: string) => void;

  joinRiderRoom: (deliveryPartnerId: string) => void;

  joinAdminRoom: () => void;

  joinOrderRoom: (orderId: string) => void;

  leaveRoom: (room: string) => void;

  updateLocation: (data: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    accuracy?: number;
  }) => void;
}

/**
 * Events emitted from the server to the client.
 */
export interface ServerToClientEvents {
  pong: () => void;

  /**
   * Customer Events
   */
  "order:created": (payload: { orderId: string }) => void;

  "order:accepted": (payload: { orderId: string }) => void;

  "order:preparing": (payload: { orderId: string }) => void;

  "order:ready": (payload: { orderId: string }) => void;

  /**
   * Rider Events
   */
  "delivery:assigned": (payload: {
    deliveryId: string;
    orderId: string;
  }) => void;

  "delivery:cancelled": (payload: { deliveryId: string }) => void;

  "delivery:updated": (payload: {
    deliveryId: string;
    status: DeliveryStatus;
  }) => void;

  /**
   * Live Tracking
   */
  "delivery:location": (payload: {
    deliveryId: string;
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
  }) => void;

  /**
   * Restaurant Events
   */
  "new:order": (payload: { orderId: string }) => void;

  "rider:arrived": (payload: { deliveryId: string }) => void;

  /**
   * Delivery Completed
   */
  "delivery:completed": (payload: {
    deliveryId: string;
    orderId: string;
  }) => void;

  /**
   * Notifications
   */
  "notification:received": (payload: any) => void;

  /**
   * Errors
   */
  "socket:error": (payload: { message: string }) => void;
}

/**
 * Server-to-server events.
 */
export interface InterServerEvents extends DefaultEventsMap {}

import { Socket } from "socket.io";

/**
 * Data attached to every authenticated socket.
 */
export interface SocketData {
  userId: string;

  role: string;
}

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
