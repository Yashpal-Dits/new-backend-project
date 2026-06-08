import * as cartRepo from "../repositories/CartRepository";
import { CART_MESSAGES } from "../constants/cartMessages";
import logger from "../config/logger";
import { logError } from "../middlewares/logger";
import type {
  IAddToCartRequest,
  IUpdateCartItemRequest,
  ICartServiceResponse,
  ICartResponse,
  ICartItemResponse,
} from "../interfaces/cartInterfaces";

const mapCartToResponse = (cart: any): ICartResponse => {
  const items: ICartItemResponse[] = (cart.items || []).map((item: any) => ({
    id: item.id,
    product_id: item.product_id,
    product_name: item.product?.name || "Unknown",
    product_price: Number(item.price),
    quantity: item.quantity,
    total: Number(item.price) * item.quantity,
  }));

  return {
    id: cart.id,
    user_id: cart.user_id,
    status: cart.status,
    items,
    total_items: items.reduce((sum, i) => sum + i.quantity, 0),
    total_price: items.reduce((sum, i) => sum + i.total, 0),
  };
};

const emptyCartResponse = (userId: number): ICartResponse => ({
  id: 0,
  user_id: userId,
  status: "active",
  items: [],
  total_items: 0,
  total_price: 0,
});

const getOrCreateReusableCart = async (userId: number): Promise<any> => {
  let cart = await cartRepo.findCartByUserId(userId);

  if (!cart) {
    return cartRepo.createCart(userId);
  }

  if (cart.status !== "active") {
    await cartRepo.activateCart(cart.id);
    cart = await cartRepo.getCartWithItems(cart.id);
  }

  return cart;
};

export const addToCart = async (
  userId: number,
  data: IAddToCartRequest
): Promise<ICartServiceResponse<ICartResponse>> => {
  try {
    const product = await cartRepo.findProductById(data.product_id);

    if (!product) {
      return {
        success: false,
        message: CART_MESSAGES.CART.PRODUCT_NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    if (!product.is_active) {
      return {
        success: false,
        message: CART_MESSAGES.CART.PRODUCT_INACTIVE,
        timestamp: new Date().toISOString(),
      };
    }

    if (product.stock < data.quantity) {
      return {
        success: false,
        message: CART_MESSAGES.CART.INSUFFICIENT_STOCK,
        timestamp: new Date().toISOString(),
      };
    }

    const cart = await getOrCreateReusableCart(userId);

    const existingItem = await cartRepo.findCartItemByProduct(
      cart.id,
      data.product_id
    );

    if (existingItem) {
      const newQty = existingItem.quantity + data.quantity;

      if (product.stock < newQty) {
        return {
          success: false,
          message: CART_MESSAGES.CART.INSUFFICIENT_STOCK,
          timestamp: new Date().toISOString(),
        };
      }

      await cartRepo.updateCartItemQuantity(existingItem.id, newQty);
      logger.info(`Updated cart item ${existingItem.id} quantity to ${newQty}`);
    } else {
      await cartRepo.createCartItem(
        cart.id,
        data.product_id,
        data.quantity,
        Number(product.price)
      );
      logger.info(`Added product ${data.product_id} to cart ${cart.id}`);
    }

    const updatedCart = await cartRepo.getCartWithItems(cart.id);

    return {
      success: true,
      message: CART_MESSAGES.CART.ITEM_ADDED,
      data: updatedCart ? mapCartToResponse(updatedCart) : undefined,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "CartService.addToCart",
      body: { userId, ...data },
    });

    return {
      success: false,
      message: CART_MESSAGES.CART.ADD_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

export const getCart = async (
  userId: number
): Promise<ICartServiceResponse<ICartResponse>> => {
  try {
    const cart = await cartRepo.findCartByUserId(userId);

    if (!cart || !cart.items || cart.items.length === 0) {
      return {
        success: false,
        message: CART_MESSAGES.CART.CART_EMPTY,
        data: emptyCartResponse(userId),
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      message: CART_MESSAGES.CART.CART_FETCHED,
      data: mapCartToResponse(cart),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "CartService.getCart",
      body: { userId },
    });

    return {
      success: false,
      message: CART_MESSAGES.CART.FETCH_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

export const updateCartItem = async (
  userId: number,
  itemId: number,
  data: IUpdateCartItemRequest
): Promise<ICartServiceResponse<ICartResponse>> => {
  try {
    const cartItem = await cartRepo.findCartItemById(itemId);

    if (!cartItem) {
      return {
        success: false,
        message: CART_MESSAGES.CART.CART_ITEM_NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    const cart = await cartRepo.getCartWithItems(cartItem.cart_id);

    if (!cart || cart.user_id !== userId) {
      return {
        success: false,
        message: CART_MESSAGES.CART.NOT_YOUR_CART_ITEM,
        timestamp: new Date().toISOString(),
      };
    }

    const product = await cartRepo.findProductById(cartItem.product_id);

    if (product && product.stock < data.quantity) {
      return {
        success: false,
        message: CART_MESSAGES.CART.INSUFFICIENT_STOCK,
        timestamp: new Date().toISOString(),
      };
    }

    await cartRepo.updateCartItemQuantity(itemId, data.quantity);
    logger.info(`Updated cart item ${itemId} quantity to ${data.quantity}`);

    const updatedCart = await cartRepo.getCartWithItems(cart.id);

    return {
      success: true,
      message: CART_MESSAGES.CART.ITEM_UPDATED,
      data: updatedCart ? mapCartToResponse(updatedCart) : undefined,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "CartService.updateCartItem",
      body: { userId, itemId, ...data },
    });

    return {
      success: false,
      message: CART_MESSAGES.CART.UPDATE_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

export const removeCartItem = async (
  userId: number,
  itemId: number
): Promise<ICartServiceResponse<ICartResponse>> => {
  try {
    const cartItem = await cartRepo.findCartItemById(itemId);

    if (!cartItem) {
      return {
        success: false,
        message: CART_MESSAGES.CART.CART_ITEM_NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    const cart = await cartRepo.getCartWithItems(cartItem.cart_id);

    if (!cart || cart.user_id !== userId) {
      return {
        success: false,
        message: CART_MESSAGES.CART.NOT_YOUR_CART_ITEM,
        timestamp: new Date().toISOString(),
      };
    }

    await cartRepo.deleteCartItem(itemId);
    logger.info(`Removed cart item ${itemId}`);

    const updatedCart = await cartRepo.getCartWithItems(cart.id);

    return {
      success: true,
      message: CART_MESSAGES.CART.ITEM_REMOVED,
      data: updatedCart ? mapCartToResponse(updatedCart) : emptyCartResponse(userId),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "CartService.removeCartItem",
      body: { userId, itemId },
    });

    return {
      success: false,
      message: CART_MESSAGES.CART.REMOVE_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

export const clearCart = async (userId: number): Promise<ICartServiceResponse> => {
  try {
    logger.info(`Service: Clearing cart for user ${userId}`);

    const cart = await cartRepo.findCartByUserId(userId);

    if (!cart) {
      return {
        success: true,
        message: CART_MESSAGES.CART.CART_EMPTY,
        timestamp: new Date().toISOString(),
      };
    }

    if (cart.status !== "active") {
      await cartRepo.activateCart(cart.id);
    }

    await cartRepo.clearCartItems(cart.id);

    logger.info(`Service: Cart ${cart.id} cleared successfully`);

    return {
      success: true,
      message: CART_MESSAGES.CART.CLEAR_SUCCESS,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "CartService.clearCart",
      body: { userId },
    });

    return {
      success: false,
      message: CART_MESSAGES.CART.CLEAR_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};