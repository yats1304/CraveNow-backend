export interface AddToCartDto {
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
}

export interface UpdateCartItemDto {
  quantity: number;
  specialInstructions?: string;
}
