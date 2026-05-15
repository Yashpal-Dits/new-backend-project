import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from "typeorm";
import { User } from "./UserEntity";
import { Address } from "./AddressEntity";
import { OrderItem } from "./OrderItemEntity";
import { Payment } from "./PaymentEntity";
import { Shipment } from "./ShipmentEntity";
import {Return} from "./ReturnEntity"

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int" })
  user_id: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total_price: number;

  @Column({ type: "int" })
  address_id: number;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;


  @ManyToOne(() => User, (user) => user.orders, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Address, (address) => address.orders)
  @JoinColumn({ name: "address_id" })
  address: Address;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  @OneToOne(() => Payment, (payment) => payment.order)
  payment: Payment;

  @OneToOne(() => Shipment, (shipment) => shipment.order)
  shipment: Shipment;

  @OneToMany(() => Return, (returnItem) => returnItem.order)
  returns: Return[];
}