import * as categoryService from "../services/index.js";
import { TryCatch } from "../utils/index.js";

export const createCategory = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const data = await categoryService.createCategory(userId, req.body);

  return res.status(201).json(data);
});

export const getAllCategories = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const data = await categoryService.getAllCategories(userId, req.query);

  return res.json(data);
});

export const getCategoryById = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const categoryId = req.params.categoryId as string;

  const data = await categoryService.getCategoryById(userId, categoryId);

  return res.json(data);
});

export const updateCategory = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const categoryId = req.params.categoryId as string;

  const data = await categoryService.updateCategory(
    userId,
    categoryId,
    req.body,
  );

  return res.json(data);
});

export const uploadCategoryImage = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const categoryId = req.params.categoryId as string;

  const data = await categoryService.uploadCategoryImage(
    userId,
    categoryId,
    req.file!,
  );

  return res.json(data);
});

export const updateCategoryStatus = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const categoryId = req.params.categoryId as string;

  const { isActive } = req.body;

  const data = await categoryService.updateCategoryStatus(
    userId,
    categoryId,
    isActive,
  );

  return res.json(data);
});

export const deleteCategory = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const categoryId = req.params.categoryId as string;

  const data = await categoryService.deleteCategory(userId, categoryId);

  return res.status(200).json(data);
});
