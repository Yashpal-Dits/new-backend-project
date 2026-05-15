import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Cart } from "./CartEntity";
import { Product } from "./ProductEntity";

@Entity("cart_items")
export class CartItem {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int" })
  cart_id: number;

  @Column({ type: "int" })
  product_id: number;

  @Column({ type: "int" })
  quantity: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  
  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "cart_id" })
  cart: Cart;

  @ManyToOne(() => Product, (product) => product.cartItems, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product: Product;
}