import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User } from "./UserEntity"
import { Order } from "./OrderEntity";
import { Shipment } from "./ShipmentEntity";

@Entity("addresses")
export class Address {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int" })
  user_id: number;

  @Column({ type: "varchar" })
  address_line: string;

  @Column({ type: "varchar" })
  city: string;

  @Column({ type: "varchar" })
  state: string;

  @Column({ type: "varchar" })
  zip_code: string;

  @Column({ type: "varchar" })
  country: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  
  @ManyToOne(() => User, (user) => user.addresses, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => Order, (order) => order.address)
  orders: Order[];

  @OneToMany(() => Shipment, (shipment) => shipment.address)
  shipments: Shipment[];
}