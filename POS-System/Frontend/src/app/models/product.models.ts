export interface Product {
  id: number;
  sku: string;
  name: string;
  nameAr: string;
  description?: string;
  categoryId: number;
  categoryName?: string;
  categoryNameAr?: string;
  barcode?: string;
  price: number;
  costPrice?: number;
  taxRate: number;
  stockQuantity: number;
  minStockLevel: number;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  nameAr: string;
  description?: string;
  categoryId: number;
  barcode?: string;
  price: number;
  costPrice?: number;
  taxRate: number;
  stockQuantity: number;
  minStockLevel: number;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface UpdateProductRequest {
  name?: string;
  nameAr?: string;
  description?: string;
  categoryId?: number;
  barcode?: string;
  price?: number;
  costPrice?: number;
  taxRate?: number;
  stockQuantity?: number;
  minStockLevel?: number;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface ProductFilterRequest {
  categoryId?: number;
  searchTerm?: string;
  isActive?: boolean;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDescending: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
