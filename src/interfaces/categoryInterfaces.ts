// Request Interfaces
export interface ICreateCategoryRequest {
  name: string;
  description?: string;
}

export interface IUpdateCategoryRequest {
  name?: string;
  description?: string;
}

// Service Response Interface (Follows your Auth pattern)
export interface ICategoryServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

// Category Response Interface (Independent of Entity)
export interface ICategoryResponse {
  id: number;
  name: string;
  description: string | null;
}