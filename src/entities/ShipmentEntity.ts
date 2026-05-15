import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Order } from "./OrderEntity";
import { Address } from "./AddressEntity";
import { ShipmentTracking } from "./ShipmentTrackingEntity"

export enum ShipmentStatus {
  PENDING = "pending",
  SHIPPED = "shipped",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
  RETURNED = "returned",
}

@Entity("shipments")
export class Shipment {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", unique: true })
  order_id: number;

  @Column({ type: "varchar", unique: true })
  tracking_number: string;

  @Column({ type: "int" })
  address_id: number;

  @Column({
    type: "enum",
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING,
  })
  status: ShipmentStatus;

  @Column({ type: "timestamp", nullable: true })
  delivered_at: Date;


  @OneToOne(() => Order, (order) => order.shipment, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @ManyToOne(() => Address, (address) => address.shipments)
  @JoinColumn({ name: "address_id" })
  address: Address;

  @OneToMany(() => ShipmentTracking, (tracking) => tracking.shipment, { cascade: true })
  trackings: ShipmentTracking[];
}