import { JwtPayload } from "../types";
import jwt, { SignOptions } from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

const ACCESS_EXPIRES_IN = process.env
  .JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"];
const REFRESH_EXPIRES_IN = process.env
  .JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"];

// generate access token
export const generateAccessToken = (payload: JwtPayload) => {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });

  return accessToken;
};

// generate refresh token
export const generateRefreshToken = (payload: JwtPayload) => {
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });

  return refreshToken;
};

// verify access token
export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
};
