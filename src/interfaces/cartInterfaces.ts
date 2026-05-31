// Cart Request Interfaces

export interface IAddToCartRequest {
  product_id: number;
  quantity: number;
}

export interface IUpdateCartItemRequest {
  quantity: number;
}

// Cart Response Interfaces 

export interface ICartItemResponse {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  total: number;
}

export interface ICartResponse {
  id: number;
  user_id: number;
  status: string;
  items: ICartItemResponse[];
  total_items: number;
  total_price: number;
}

// Checkout Interfaces

export interface ICheckoutRequest {
  address_id: number;
  payment_method: string;
}

export interface ICheckoutResponse {
  order_id: number;
  total_price: number;
  status: string;
  payment_status: string;
}

// Service Response

export interface ICartServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}
