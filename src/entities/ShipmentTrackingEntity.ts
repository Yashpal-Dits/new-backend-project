import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Shipment } from "./ShipmentEntity";

@Entity("shipment_tracking")
export class ShipmentTracking {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int" })
  shipment_id: number;

  @Column({ type: "varchar" })
  status: string;

  @Column({ type: "varchar" })
  location: string;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  
  @ManyToOne(() => Shipment, (shipment) => shipment.trackings, { onDelete: "CASCADE" })
  @JoinColumn({ name: "shipment_id" })
  shipment: Shipment;
}