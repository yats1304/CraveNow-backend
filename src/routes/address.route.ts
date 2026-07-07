import express from "express";
import { isAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  AddressIdParam,
  createAddressSchema,
  updateAddressSchema,
} from "../validators";
import * as addressController from "../controllers";

const router = express.Router();

router.post(
  "/",
  isAuth,
  validate(createAddressSchema),
  addressController.createAddress,
);
router.put(
  "/:addressId",
  isAuth,
  validate(AddressIdParam, "params"),
  validate(updateAddressSchema),
  addressController.updatedAddress,
);
router.put(
  "/:addressId/default",
  isAuth,
  validate(AddressIdParam, "params"),
  addressController.setDefaultAddress,
);
router.get("/", isAuth, addressController.getMyAddresses);
router.get(
  "/:addressId",
  isAuth,
  validate(AddressIdParam, "params"),
  addressController.getAddressById,
);
router.delete(
  "/:addressId",
  isAuth,
  validate(AddressIdParam, "params"),
  addressController.deleteAddress,
);

export default router;
