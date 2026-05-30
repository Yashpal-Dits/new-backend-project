// Request interfaces
export interface ICreateStoreRequest {
  user_id: number;
  store_name: string;
  description?: string;
  business_email?: string;
  is_active?: boolean;
}

export interface IUpdateStoreRequest {
  user_id?: number;
  store_name?: string;
  description?: string;
  business_email?: string;
  is_active?: boolean;
}

// Store response interface
export interface IStoreResponse {
  id: number;
  user_id: number;
  store_name: string;
  description: string | null;
  business_email: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Service response interface
export interface IStoreServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}
