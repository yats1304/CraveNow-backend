import { env } from "../config/env.js";
import { OAuth2Client } from "google-auth-library";
import { ErrorHandler } from "./errorHandler.js";
import { GoogleUser } from "../types/index.js";

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const verifyGoogleIdToken = async (idToken: string): Promise<GoogleUser> => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new ErrorHandler(401, "Invalid Google token");
  }

  return {
    googleId: payload.sub,
    email: payload.email!,
    name: payload.name!,
    avatar: payload.picture,
    emailVerified: payload.email_verified,
  };
};
