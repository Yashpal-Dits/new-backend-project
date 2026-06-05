import { AppDataSource } from "../config/dataSource";
import { Order } from "../entities/OrderEntity";
import { OrderItem } from "../entities/OrderItemEntity";
import { EntityManager } from "typeorm";

const orderRepository = AppDataSource.getRepository(Order);
const orderItemRepository = AppDataSource.getRepository(OrderItem);

export const createOrder = async (orderData: Partial<Order>, manager?: EntityManager): Promise<Order> => {
  const repo = manager ? manager.getRepository(Order) : orderRepository;
  const order = repo.create(orderData);
  return repo.save(order);
};

export const createOrderItem = async (orderItemData: Partial<OrderItem>, manager?: EntityManager): Promise<OrderItem> => {
  const repo = manager ? manager.getRepository(OrderItem) : orderItemRepository;
  const item = repo.create(orderItemData);
  return repo.save(item);
};

export const findOrderById = async (id: number): Promise<Order | null> => {
  return orderRepository.findOne({
    where: { id },
    relations: ["items", "items.product", "address"],
  });
};

export const findOrderByUserId = async (userId: number): Promise<Order[]> => {
  return orderRepository.find({
    where: { user_id: userId },
    relations: ["items", "items.product", "address"],
    order: { created_at: "DESC" as any }, 
  });
};

export const updateOrderStatus = async (id: number, status: any, manager?: EntityManager): Promise<void> => {
  const repo = manager ? manager.getRepository(Order) : orderRepository;
  await repo.update(id, { status });
};