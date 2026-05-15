import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Order } from "./OrderEntity";
import { Product } from "./ProductEntity";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int" })
  order_id: number;

  @Column({ type: "int" })
  product_id: number;

  @Column({ type: "int" })
  quantity: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  
  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderItems)
  @JoinColumn({ name: "product_id" })
  product: Product;
}