import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Return } from "./ReturnEntity";

export enum RefundStatus {
  PENDING = "pending",
  PROCESSED = "processed",
  FAILED = "failed",
}

@Entity("refunds")
export class Refund {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", unique: true })
  return_id: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: "enum",
    enum: RefundStatus,
    default: RefundStatus.PENDING,
  })
  status: RefundStatus;

  @Column({ type: "timestamp", nullable: true })
  refund_date: Date;

  
  @OneToOne(() => Return, (returnItem) => returnItem.refund, { onDelete: "CASCADE" })
  @JoinColumn({ name: "return_id" })
  returnItem: Return;
}``