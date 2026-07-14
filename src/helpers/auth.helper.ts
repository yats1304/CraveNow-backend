import { redisClient } from "../config/redis.js";
import { REFRESH_TOKEN_EXPIRY } from "../constants/index.js";
import { UserRole } from "../types/index.js";
import { generateAccessToken, generateRefreshToken } from "../utils/index.js";
import { getRefreshKey } from "../constants/index.js";

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
