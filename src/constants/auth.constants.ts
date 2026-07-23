export const OTP_EXPIRY = 60 * 5;

export const OTP_RESEND_COOLDOWN = 60;

export const MAX_OTP_RESEND = 5;

export const REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 30;

export const getRefreshKey = (userId: string, deviceId: string): string =>
  `refresh:${userId}:${deviceId}`;
