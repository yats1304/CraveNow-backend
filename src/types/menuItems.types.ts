export enum FoodType {
  VEG = "VEG",
  NON_VEG = "NON_VEG",
  BOTH = "BOTH",
}

export interface CreateMenuItemDto {
  categoryId: string;
  name: string;
  description?: string;
  tags: string[];
  price: number;
  discountPercentage?: number;
  foodType: FoodType;
  preparationTime: number;
  isFeatured?: boolean;
}

export type UpdateMenuItemDto = Partial<CreateMenuItemDto>;

export interface UploadMenuItemImagesDto {
  files: Express.Multer.File[];
}

export interface UpdateMenuItemStatusDto {
  isAvailable: boolean;
}

export interface GetAllMenuItemsDto {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  foodType?: FoodType;
  isAvailable?: boolean;
  isFeatured?: boolean;
}
