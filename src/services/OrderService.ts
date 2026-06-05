import { AppDataSource } from "../config/dataSource";
import * as OrderRepository from "../repositories/OrderRepository";
import * as CartRepository from "../repositories/CartRepository";
import * as AddressRepository from "../repositories/AddressRepository";
import * as ProductRepository from "../repositories/ProductRepository";
import { ORDER_MESSAGES } from "../constants/orderMessages";
import logger from "../config/logger";
import { logError } from "../middlewares/logger";
import { Order, OrderStatus } from "../entities/OrderEntity";
import type {
  ICheckoutRequest,
  IOrderServiceResponse,
  IOrderResponse
}
  from "../interfaces/orderInterfaces";

// Helper to map  order response
const mapToResponse = (order: Order): IOrderResponse => {

  return {
    id: order.id,
    user_id: order.user_id,
    total_price: Number(order.total_price),
    address_id: order.address_id,
    status: order.status,
    items: (order.items || []).map((item) => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: Number(item.price),
      product_name: item.product?.name || "Unknown",
    })),
    created_at: (order as any).created_at || new Date(),
  };
};

export const checkout = async (userId: number, data: ICheckoutRequest): Promise<IOrderServiceResponse<IOrderResponse>> => {

  // 1. Initialize QueryRunner for Transaction
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    logger.info(`Starting checkout transaction for user ${userId}`);

    // 2. Validate Address 
    const address = await AddressRepository.findAddressById(data.address_id);
    if (!address || address.user_id !== userId) {
      await queryRunner.rollbackTransaction();
      return { success: false, message: ORDER_MESSAGES.ORDER.ADDRESS_NOT_FOUND, timestamp: new Date().toISOString() };
    }

    // 3. Find active cart 
    const cart = await CartRepository.findActiveCartByUserId(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      await queryRunner.rollbackTransaction();
      return { success: false, message: ORDER_MESSAGES.ORDER.CART_EMPTY, timestamp: new Date().toISOString() };
    }

    // 4. Stock check and total calculation 
    let totalPrice = 0;
    for (const item of cart.items) {
      const product = await ProductRepository.findProductById(item.product_id);
      if (!product || product.stock < item.quantity) {
        await queryRunner.rollbackTransaction();
        return { success: false, message: ORDER_MESSAGES.ORDER.INSUFFICIENT_STOCK, timestamp: new Date().toISOString() };
      }
      totalPrice += Number(item.price) * item.quantity;
    }

    // 5. Create Order 
    const order = await OrderRepository.createOrder({
      user_id: userId,
      address_id: data.address_id,
      total_price: totalPrice,
      status: OrderStatus.PENDING,
    }, queryRunner.manager);

    // 6. Create Order Items and Update Product Stock
    for (const item of cart.items) {
      await OrderRepository.createOrderItem({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }, queryRunner.manager);

      const product = await ProductRepository.findProductById(item.product_id);
      if (product) {
        await ProductRepository.updateProduct(product.id, {
          stock: product.stock - item.quantity,
        }, queryRunner.manager);
      }
    }

    // 7. Mark Cart as Converted
    await CartRepository.markCartAsConverted(cart.id, queryRunner.manager);

    await queryRunner.commitTransaction();
    logger.info(`Order ${order.id} committed successfully`);

    const finalOrder = await OrderRepository.findOrderById(order.id);

    return {
      success: true,
      message: ORDER_MESSAGES.ORDER.CHECKOUT_SUCCESS,
      data: mapToResponse(finalOrder!),
      timestamp: new Date().toISOString()
    };

  } catch (error) {

    await queryRunner.rollbackTransaction();
    logError(error as Error, { endpoint: "OrderService.checkout", body: { userId, ...data } });
    return { success: false, message: ORDER_MESSAGES.ORDER.CHECKOUT_FAILED, timestamp: new Date().toISOString() };
  } finally {

    await queryRunner.release();
  }
};

export const getUserOrders = async (userId: number): Promise<IOrderServiceResponse<IOrderResponse[]>> => {
  try {
    logger.info(`Fetching orders for user ${userId}`);

    const orders = await OrderRepository.findOrderByUserId(userId);
    return {
      success: true,
      message: ORDER_MESSAGES.ORDER.FETCH_SUCCESS,
      data: orders.map(mapToResponse),
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    logError(error as Error, {
      endpoint: "OrderService.getUserOrders",
      body: { userId }

    });

    return { success: false, message: ORDER_MESSAGES.ORDER.FETCH_FAILED, timestamp: new Date().toISOString() };
  }
};

export const getOrderById = async (userId: number, orderId: number): Promise<IOrderServiceResponse<IOrderResponse>> => {
  try {
    logger.info(`Fetching order ${orderId} for user ${userId}`);
    const order = await OrderRepository.findOrderById(orderId);

    if (!order || order.user_id !== userId) {

      return {
        success: false,
        message: order ? ORDER_MESSAGES.ORDER.UNAUTHORIZED : ORDER_MESSAGES.ORDER.NOT_FOUND,
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: true,
      message: ORDER_MESSAGES.ORDER.FETCH_SUCCESS,
      data: mapToResponse(order),
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    logError(error as Error, {
      endpoint: "OrderService.getOrderById",
      body: { userId, orderId }
    });

    return {
      success: false,
      message: ORDER_MESSAGES.ORDER.FETCH_FAILED,
      timestamp: new Date().toISOString()
    };
  }
};

export const cancelOrder = async (userId: number, orderId: number): Promise<IOrderServiceResponse> => {

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    logger.info(`Starting cancellation transaction for order ${orderId}`);

    const order = await OrderRepository.findOrderById(orderId); 

    if (!order || order.user_id !== userId) {
      await queryRunner.rollbackTransaction();

      return {
        success: false,
        message: order ? ORDER_MESSAGES.ORDER.UNAUTHORIZED : ORDER_MESSAGES.ORDER.NOT_FOUND,
        timestamp: new Date().toISOString()
      };
    }

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {

      await queryRunner.rollbackTransaction();

      return {
        success: false,
        message: ORDER_MESSAGES.ORDER.NOT_CANCELLABLE,
        timestamp: new Date().toISOString()
      };
    }

    // 1. Update Order Status 
    await OrderRepository.updateOrderStatus(orderId, OrderStatus.CANCELLED, queryRunner.manager);

    // 2. Restore Stock
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        const product = await ProductRepository.findProductById(item.product_id);

        if (product) {
          await ProductRepository.updateProduct(product.id, { stock: product.stock + item.quantity }, queryRunner.manager);
        }
      }
    }

    await queryRunner.commitTransaction();

    logger.info(` Order ${orderId} cancelled and stock restored successfully`);

    return {
      success: true,
      message: ORDER_MESSAGES.ORDER.CANCEL_SUCCESS,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    await queryRunner.rollbackTransaction();
    logError(error as Error, {
      endpoint: "OrderService.cancelOrder",
      body: { userId, orderId }
    });

    return {
      success: false,
      message: ORDER_MESSAGES.ORDER.CANCEL_FAILED,
      timestamp: new Date().toISOString()
    };

  } finally {
    await queryRunner.release();
  }
};