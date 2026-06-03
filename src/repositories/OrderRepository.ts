import { AppDataSource } from "../config/dataSource";
import { Order } from "../entities/OrderEntity";
import { OrderItem } from "../entities/OrderItemEntity";

const orderRepository = AppDataSource.getRepository(Order);
const orderItemRepository = AppDataSource.getRepository(OrderItem);

export const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
  const order = orderRepository.create(orderData);
  return orderRepository.save(order);
};

export const createOrderItem = async (orderItemData: Partial<OrderItem>): Promise<OrderItem> => {
  const item = orderItemRepository.create(orderItemData);
  return orderItemRepository.save(item);
};

export const findOrderById = async (id: number): Promise<Order | null> => {
  return orderRepository.findOne({
    where: { id },
    relations: ["items", "items.product", "address"],
  });
};

export const findOrdersByUserId = async (userId: number): Promise<Order[]> => {
  return orderRepository.find({
    where: { user_id: userId },
    relations: ["items", "items.product", "address"],
    order: { created_at: "DESC" as any },
  });
};

export const updateOrderStatus = async (id: number, status: any): Promise<void> => {
  await orderRepository.update(id, { status });
};