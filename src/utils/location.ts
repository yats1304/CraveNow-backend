interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculates the distance between two coordinates in kilometers using the Haversine formula.
 *
 * @param start - The starting coordinates (latitude, longitude)
 * @param end - The ending coordinates (latitude, longitude)
 * @returns The distance in kilometers
 * @throws Error - "Not implemented" for now
 */
export const calculateDistance = (
  start: Coordinates,
  end: Coordinates,
): number => {
  throw new Error("calculateDistance is not implemented yet.");
};

/**
 * Calculates the estimated time of arrival (ETA) in minutes based on distance and speed.
 *
 * @param distanceKm - The distance in kilometers
 * @param averageSpeedKmh - The average speed of the rider in km/h
 * @returns The estimated time in minutes
 * @throws Error - "Not implemented" for now
 */
export const calculateETA = (
  distanceKm: number,
  averageSpeedKmh = 30,
): number => {
  throw new Error("calculateETA is not implemented yet.");
};
