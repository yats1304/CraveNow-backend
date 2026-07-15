import * as riderLocationService from "../services/riderLocation.service.js";
import { TryCatch } from "../utils/index.js";

export const updateLocation = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const location = await riderLocationService.updateLocation(userId, req.body);

  return res.status(200).json({
    success: true,
    message: "Location updated successfully.",
    location,
  });
});
