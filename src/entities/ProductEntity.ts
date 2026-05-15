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
import { Store } from "./StoreEntity";
import { Category } from "./CategoryEntity";
import { CartItem } from "./CartItemEntity"
import { OrderItem } from "./OrderItemEntity";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int" })
  store_id: number;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ type: "int" })
  categories_id: number;

  @Column({ type: "int", default: 0 })
  stock: number;

  @Column({ type: "varchar", nullable: true })
  sku: string;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  
  @ManyToOne(() => Store, (store) => store.products, { onDelete: "CASCADE" })
  @JoinColumn({ name: "store_id" })
  store: Store;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: "categories_id" })
  category: Category;

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
}