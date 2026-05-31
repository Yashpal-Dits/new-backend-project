import * as cartRepo from "../repositories/CartRepository";
import { CART_MESSAGES } from "../constants/cartMessages";
import { AppDataSource } from "../config/dataSource";
import { Order, OrderStatus } from "../entities/OrderEntity";
import { OrderItem } from "../entities/OrderItemEntity";
import { Payment, PaymentMethod, PaymentStatus } from "../entities/PaymentEntity";
import { Cart, CartStatus } from "../entities/CartEntity";
import { Product } from "../entities/ProductEntity";
import { Address } from "../entities/AddressEntity";
import logger from "../config/logger";
import { logError } from "../middlewares/logger";
import type {
  IAddToCartRequest,
  IUpdateCartItemRequest,
  ICartServiceResponse,
  ICartResponse,
  ICartItemResponse,
  ICheckoutRequest,
  ICheckoutResponse,
} from "../interfaces/cartInterfaces";

const mapCartToResponse = (cart: any): ICartItemResponse => {
    const items: ICartItemResponse[] = (cart.items || [].map(item:any) => ({
        id: item.id,

    }))
}