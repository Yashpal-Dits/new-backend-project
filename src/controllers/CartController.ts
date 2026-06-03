import { Response } from "express";
import * as cartService from "../services/CartService";
import { CART_MESSAGES } from "../constants/cartMessages";
import { HttpStatusCode } from "../enums";
import logger from "../config/logger";
import { logError } from "../middlewares/logger";
import type { IAuthenticatedRequest } from "../interfaces/authInterfaces";
import type {
  IAddToCartRequest,
  IUpdateCartItemRequest,
} from "../interfaces/cartInterfaces";

// ─── Add to Cart ─────────────────

export const addToCart = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "User not authenticated",
        timestamp: new Date().toISOString(),
      });
    }

    const data: IAddToCartRequest = req.body;
    logger.info(`Add to cart - User: ${userId}, Product: ${data.product_id}, Qty: ${data.quantity}`);

    const result = await cartService.addToCart(userId, data);

    return res
      .status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST)
      .json(result);
  } catch (error) {
    logError(error as Error, {
      endpoint: "/api/cart",
      method: "POST",
      body: req.body,
    });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: CART_MESSAGES.CART.ADD_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};

// ─── Get Cart ──────────────

export const getCart = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "User not authenticated",
        timestamp: new Date().toISOString(),
      });
    }

    logger.info(`Fetch cart for user: ${userId}`);

    const result = await cartService.getCart(userId);

    return res.status(HttpStatusCode.OK).json(result);
  } catch (error) {
    logError(error as Error, {
      endpoint: "/api/cart",
      method: "GET",
    });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: CART_MESSAGES.CART.FETCH_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};

// ─── Update Cart Item ────────────────

export const updateCartItem = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "User not authenticated",
        timestamp: new Date().toISOString(),
      });
    }

    const itemId = parseInt(req.params.itemId as string, 10);
    const data: IUpdateCartItemRequest = req.body;

    logger.info(`Update cart item ${itemId} - User: ${userId}`);

    const result = await cartService.updateCartItem(userId, itemId, data);

    return res
      .status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST)
      .json(result);
  } catch (error) {
    logError(error as Error, {
      endpoint: `/api/cart/items/${req.params.itemId as string}`,
      method: "PUT",
      body: req.body,
    });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: CART_MESSAGES.CART.UPDATE_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};

// ─── Remove Cart Item ─────

export const removeCartItem = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "User not authenticated",
        timestamp: new Date().toISOString(),
      });
    }

    const itemId = parseInt(req.params.itemId as string, 10);
    logger.info(`Remove cart item ${itemId} - User: ${userId}`);

    const result = await cartService.removeCartItem(userId, itemId);

    return res
      .status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST)
      .json(result);
  } catch (error) {
    logError(error as Error, {
      endpoint: `/api/cart/items/${req.params.itemId as string}`,
      method: "DELETE",
    });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: CART_MESSAGES.CART.REMOVE_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};

export const clearCart = async (
  req: IAuthenticatedRequest, // Changed from Request to IAuthenticatedRequest
  res: Response
): Promise<Response> => {
  try {
    const userId = req.userId; // Use req.userId to match your other functions

    if (!userId) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "User not authenticated",
        timestamp: new Date().toISOString(),
      });
    }

    logger.info(`Clearing cart for user ${userId}`);

    const result = await cartService.clearCart(userId);

    return res
      .status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST)
      .json(result);
  } catch (error) {
    logError(error as Error, { 
      endpoint: "/api/cart/clear", 
      method: "DELETE" 
    });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: CART_MESSAGES.CART.CLEAR_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};
