import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { OTPPurpose } from "../enums";
import { User } from "./UserEntity";

@Entity("otps")
export class OTP {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "varchar", length: 10 })
  otp: string;

  @Column({ type: "timestamp" })
  expires_at: Date;

  @Column({ type: "boolean", default: false })
  is_used: boolean;

  @Column({
    type: "enum",
    enum: OTPPurpose,
    default: OTPPurpose.REGISTRATION,
  })
  purpose: OTPPurpose;

  @Column({ type: "varchar" })
  email: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @Column({ type: "int", nullable: true })
  user_id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "user_id" })
  user: User;
}