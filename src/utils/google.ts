import { OAuth2Client } from "google-auth-library";
import { ErrorHandler } from "./errorHandler";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleIdToken = async (idToken: string) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
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
