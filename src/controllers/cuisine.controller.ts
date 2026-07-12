import { TryCatch } from "../utils/index.js";
import * as cuisineService from "../services/index.js";

export const createCuisine = TryCatch(async (req, res) => {
  const { name, description } = req.body;

  const data = await cuisineService.createCuisine(name, description);

  return res.status(201).json(data);
});

export const getAllCuisine = TryCatch(async (req, res) => {
  const data = await cuisineService.getAllCuisine(req.query);

  return res.json(data);
});

export const getCuisineById = TryCatch(async (req, res) => {
  const cuisineId = req.params.cuisineId as string;

  const data = await cuisineService.getCuisineById(cuisineId);

  return res.json(data);
});

export const updateCuisine = TryCatch(async (req, res) => {
  const cuisineId = req.params.cuisineId as string;

  const { name, description } = req.body;

  const data = await cuisineService.updateCuisine(cuisineId, name, description);

  return res.json(data);
});

export const uploadCuisineImage = TryCatch(async (req, res) => {
  const cuisineId = req.params.cuisineId as string;

  const data = await cuisineService.uploadCuisineImage(cuisineId, req.file!);

  return res.json(data);
});

export const toggleCuisineStatus = TryCatch(async (req, res) => {
  const cuisineId = req.params.cuisineId as string;

  const data = await cuisineService.toggleCuisineStatus(
    cuisineId,
    req.body.isActive,
  );

  return res.json(data);
});

export const deleteCuisine = TryCatch(async (req, res) => {
  const cuisineId = req.params.cuisineId as string;

  const data = await cuisineService.deleteCuisine(cuisineId);

  return res.json(data);
});
