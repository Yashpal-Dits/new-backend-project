// Request interfaces
export interface ICreateProductRequest {
  store_id: number;
  name: string;
  price: number;
  categories_id: number;
  stock?: number;
  description?: string;
  image?: string;
  sku?: string;
  is_active?: boolean;
}

export interface IUpdateProductRequest {
  name?: string;
  price?: number;
  categories_id?: number;
  stock?: number;
  description?: string;
  image?: string;
  sku?: string;
  is_active?: boolean;
  store_id?: number;
}

// Response Interface
export interface IProductResponse {
  id: number;
  store_id: number;
  name: string;
  price: number;
  categories_id: number;
  stock: number;
  description: string | null;
  image: string | null;
  sku: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Service Response
export interface IProductServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}