import { Request, Response } from "express";
import * as OrderService from "../services/OrderService";
import { ORDER_MESSAGES } from "../constants/orderMessages";
import { HttpStatusCode } from "../enums";
import logger from "../config/logger";
import { logError } from "../middlewares/logger";
import type { ICheckoutRequest } from "../interfaces/orderInterfaces";

export const checkout = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user.id;
    const checkoutData: ICheckoutRequest = req.body;

    logger.info(`Processing checkout for user ${userId}`);

    const result = await OrderService.checkout(userId, checkoutData);
    return res.status(result.success ? HttpStatusCode.CREATED : HttpStatusCode.BAD_REQUEST).json(result);

  } catch (error) {
    logError(error as Error, { endpoint: "/api/orders/checkout", method: "POST", body: req.body });

    return res
    .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
    .json({ success: false, message: ORDER_MESSAGES.ORDER.CHECKOUT_FAILED, timestamp: new Date().toISOString() });
  }
};

export const getUserOrders = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user.id;

    logger.info(`Fetching orders for user ${userId}`);

    const result = await OrderService.getUserOrders(userId);
    return res.status(HttpStatusCode.OK).json(result);
  } catch (error) {
    logError(error as Error, { endpoint: "/api/orders", method: "GET" });
    return res
    .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
    .json({ success: false, message: ORDER_MESSAGES.ORDER.FETCH_FAILED, timestamp: new Date().toISOString() });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user.id;
    const orderId = Number(req.params.id);

    logger.info(`Fetching order ${orderId} for user ${userId}`);

    const result = await OrderService.getOrderById(userId, orderId);
    return res
    .status(result.success ? HttpStatusCode.OK : HttpStatusCode.NOT_FOUND)
    .json(result);
  } catch (error) {
    logError(error as Error, { endpoint: `/api/orders/${req.params.id}`, method: "GET" });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: ORDER_MESSAGES.ORDER.FETCH_FAILED, timestamp: new Date().toISOString() });
  }
};

export const cancelOrder = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user.id;
    const orderId = Number(req.params.id);

    logger.info(`Cancelling order ${orderId} for user ${userId}`);

    const result = await OrderService.cancelOrder(userId, orderId);
    return res
    .status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST)
    .json(result);

  } catch (error) {
    logError(error as Error, { endpoint: `/api/orders/${req.params.id}/cancel`, method: "PATCH" });
    return res
    .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
    .json({ success: false, message: ORDER_MESSAGES.ORDER.CANCEL_FAILED, 
        timestamp: new Date().toISOString() });
  }
};