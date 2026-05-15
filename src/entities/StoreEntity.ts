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
import { User } from "./UserEntity";
import { Product } from "./ProductEntity";

@Entity("stores")
export class Store {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int" })
  user_id: number;

  @Column({ type: "varchar" })
  store_name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "varchar", nullable: true })
  business_email: string;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  
  @ManyToOne(() => User, (user) => user.stores, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => Product, (product) => product.store)
  products: Product[];
}