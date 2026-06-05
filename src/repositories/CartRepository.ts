import { AppDataSource } from "../config/dataSource";
import { Cart } from "../entities/CartEntity";
import { CartItem } from "../entities/CartItemEntity";
import { Product } from "../entities/ProductEntity";
import { EntityManager } from "typeorm";



const cartRepository = AppDataSource.getRepository(Cart);
const cartItemRepository = AppDataSource.getRepository(CartItem);


export const findActiveCartByUserId = async (userId: number): Promise<Cart | null> => {
  return cartRepository.findOne({
    where: { user_id: userId, status: "active" as any },
    relations: ["items", "items.product"],
  });
};

export const getCartWithItems = async (cartId: number): Promise<Cart | null> => {
  return cartRepository.findOne({
    where: { id: cartId },
    relations: ["items", "items.product"],
  });
};

export const findCartItemByProduct = async (
  cartId: number,
  productId: number
): Promise<CartItem | null> => {
  return cartItemRepository.findOne({
    where: { cart_id: cartId, product_id: productId },
    relations: ["product"],
  });
};

export const findCartItemById = async (itemId: number): Promise<CartItem | null> => {
  return cartItemRepository.findOne({
    where: { id: itemId },
    relations: ["cart", "product"],
  });
};

export const findProductById = async (id: number): Promise<Product | null> => {
  const productRepo = AppDataSource.getRepository(Product);
  return productRepo.findOne({ where: { id } });
};

// ─── WRITE OPERATIONS ─────

export const createCart = async (userId: number, manager?: EntityManager): Promise<Cart> => {
  const repo = manager ? manager.getRepository(Cart) : cartRepository;
  const cart = repo.create({ user_id: userId, status: "active" as any });
  return repo.save(cart);
};

export const markCartAsConverted = async (cartId: number, manager?: EntityManager): Promise<void> => {
  const repo = manager ? manager.getRepository(Cart) : cartRepository;
  await repo.update(cartId, { status: "converted" as any });
};

export const createCartItem = async (
  cartId: number,
  productId: number,
  quantity: number,
  price: number,
  manager?: EntityManager
): Promise<CartItem> => {
  const repo = manager ? manager.getRepository(CartItem) : cartItemRepository;
  const item = repo.create({
    cart_id: cartId,
    product_id: productId,
    quantity,
    price,
  });
  return repo.save(item);
};

export const updateCartItemQuantity = async (
  itemId: number,
  quantity: number,
  manager?: EntityManager
): Promise<void> => {
  const repo = manager ? manager.getRepository(CartItem) : cartItemRepository;
  await repo.update(itemId, { quantity });
};

export const deleteCartItem = async (itemId: number, manager?: EntityManager): Promise<void> => {
  const repo = manager ? manager.getRepository(CartItem) : cartItemRepository;
  await repo.delete(itemId);
};

export const clearCartItems = async (cartId: number, manager?: EntityManager): Promise<void> => {
  const repo = manager ? manager.getRepository(CartItem) : cartItemRepository;
  await repo.delete({ cart_id: cartId });
};