import { redisClient } from "../config/redis";
import { REFRESH_TOKEN_EXPIRY } from "../constants";
import { UserRole } from "../types";
import { generateAccessToken, generateRefreshToken } from "../utils";
import { getRefreshKey } from "../constants";

interface CreateSessionParams {
  userId: string;
  role: UserRole;
  deviceId: string;
}

export const createUserSession = async ({
  userId,
  role,
  deviceId,
}: CreateSessionParams) => {
  const payload = {
    userId,
    role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await redisClient.set(getRefreshKey(userId, deviceId), refreshToken, {
    EX: REFRESH_TOKEN_EXPIRY,
  });

  return {
    accessToken,
    refreshToken,
  };
};
