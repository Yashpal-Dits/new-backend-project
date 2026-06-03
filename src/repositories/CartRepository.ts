import { AppDataSource } from "../config/dataSource";
import { Cart } from "../entities/CartEntity";
import { CartItem } from "../entities/CartItemEntity";
import { Product } from "../entities/ProductEntity";

const cartRepository = AppDataSource.getRepository(Cart);
const cartItemRepository = AppDataSource.getRepository(CartItem);

export const findActiveCartByUserId = async (userId: number): Promise<Cart | null> => {
  return cartRepository.findOne({
    where: { user_id: userId, status: "active" as any },
    relations: ["items", "items.product"],
  });
};

export const createCart = async (userId: number): Promise<Cart> => {
  const cart = cartRepository.create({ user_id: userId, status: "active" as any });
  return cartRepository.save(cart);
};

export const getCartWithItems = async (cartId: number): Promise<Cart | null> => {
  return cartRepository.findOne({
    where: { id: cartId },
    relations: ["items", "items.product"],
  });
};

export const markCartAsConverted = async (cartId: number): Promise<void> => {
  await cartRepository.update(cartId, { status: "converted" as any });
};

//--- Cart Items---

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

export const createCartItem = async (
  cartId: number,
  productId: number,
  quantity: number,
  price: number
): Promise<CartItem> => {
  const item = cartItemRepository.create({
    cart_id: cartId,
    product_id: productId,
    quantity,
    price,
  });
  return cartItemRepository.save(item);
};

export const updateCartItemQuantity = async (
  itemId: number,
  quantity: number
): Promise<void> => {
  await cartItemRepository.update(itemId, { quantity });
};

export const deleteCartItem = async (itemId: number): Promise<void> => {
  await cartItemRepository.delete(itemId);
};


export const findProductById = async (id: number): Promise<Product | null> => {
  const productRepo = AppDataSource.getRepository(Product);
  return productRepo.findOne({ where: { id } });
};


export const clearCartItems = async (cartId: number): Promise<void> => {
  await cartItemRepository.delete({ cart_id: cartId });

};