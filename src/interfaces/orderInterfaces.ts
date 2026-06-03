
export interface ICheckoutRequest {
  address_id: number;
}

export interface IOrderResponse {
  id: number;
  user_id: number;
  total_price: number;
  address_id: number;
  status: string;
  items: IOrderItemResponse[];
  created_at: Date;
}

export interface IOrderItemResponse {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name: string;
}

export interface IOrderServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}
