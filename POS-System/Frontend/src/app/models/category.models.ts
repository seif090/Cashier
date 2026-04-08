export interface Category {
  id: number;
  name: string;
  nameAr: string;
  description?: string;
  icon?: string;
  color?: string;
  parentCategoryId?: number;
  parentCategoryName?: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: Date;
}

export interface CreateCategoryRequest {
  name: string;
  nameAr: string;
  description?: string;
  icon?: string;
  color?: string;
  parentCategoryId?: number;
  sortOrder: number;
  isActive: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  nameAr?: string;
  description?: string;
  icon?: string;
  color?: string;
  parentCategoryId?: number;
  sortOrder?: number;
  isActive?: boolean;
}
