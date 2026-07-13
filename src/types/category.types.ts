export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

export interface UploadCategoryImageDto {
  file: Express.Multer.File;
}

export interface ToggleCategoryStatusDto {
  isActive: boolean;
}

export interface GetAllCategoriesDto {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}
