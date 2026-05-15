import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    OneToMany,
    JoinColumn
 } from "typeorm";


import { User } from "./UserEntity";
import { CartItem } from "./CartItemEntity";

export enum CartStatus {
  ACTIVE = "active",
  ABANDONED = "abandoned",
  CONVERTED = "converted",
}

@Entity("cart")
export class Cart {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", unique: true })
  user_id: number;

  @Column({
    type: "enum",
    enum: CartStatus,
    default: CartStatus.ACTIVE,
  })
  status: CartStatus;

  
  @OneToOne(() => User, (user) => user.cart, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, { cascade: true })
  items: CartItem[];
}