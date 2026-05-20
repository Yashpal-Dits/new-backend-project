import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Order } from "./OrderEntity";

export enum PaymentMethod {
  CARD = "card",
  UPI = "upi",
  COD = "cod",
  PAYPAL = "paypal",
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", unique: true })
  order_id: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  payment_method_id: number;

  @Column({
    type: "enum",
    enum: PaymentMethod,
    nullable: true,
  })
  payment_method: PaymentMethod;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;


  @OneToOne(() => Order, (order) => order.payment, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order: Order;
}