import { Request, Response } from "express";
import * as AddressService from "../services/AddressService";
import { ADDRESS_MESSAGES } from "../constants/addressMessages";
import { HttpStatusCode } from "../enums";
import logger from "../config/logger";
import { logError } from "../middlewares/logger";
import type { ICreateAddressRequest, IUpdateAddressRequest } from "../interfaces/addressInterfaces";

export const createAddress = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user.id;
    const addressData: ICreateAddressRequest = req.body;

    logger.info(`Creating address for user ${userId}`);
    const result = await AddressService.createAddress(userId, addressData);

    return res
      .status(result.success ? HttpStatusCode.CREATED : HttpStatusCode.BAD_REQUEST)
      .json(result);
  } catch (error) {
    logError(error as Error, { endpoint: "/api/addresses", method: "POST", body: req.body });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ADDRESS_MESSAGES.ADDRESS.CREATION_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};

export const getAddresses = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user.id;
    logger.info(`Fetching addresses for user ${userId}`);

    const result = await AddressService.getAddresses(userId);
    return res.status(HttpStatusCode.OK).json(result);
  } catch (error) {
    logError(error as Error, { endpoint: "/api/addresses", method: "GET" });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ADDRESS_MESSAGES.ADDRESS.FETCH_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};

export const updateAddress = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user.id;
    const addressId = Number(req.params.id);
    const updateData: IUpdateAddressRequest = req.body;

    if (isNaN(addressId)) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, message: "Invalid ID" });
    }

    logger.info(`Updating address ${addressId} for user ${userId}`);
    const result = await AddressService.updateAddress(userId, addressId, updateData);

    return res
      .status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST)
      .json(result);
  } catch (error) {
    logError(error as Error, { endpoint: `/api/addresses/${req.params.id}`, method: "PUT", body: req.body });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ADDRESS_MESSAGES.ADDRESS.UPDATE_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};

export const deleteAddress = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user.id;
    const addressId = Number(req.params.id);

    logger.info(`Deleting address ${addressId} for user ${userId}`);
    const result = await AddressService.deleteAddress(userId, addressId);

    return res
      .status(result.success ? HttpStatusCode.OK : HttpStatusCode.NOT_FOUND)
      .json(result);
  } catch (error) {
    logError(error as Error, { endpoint: `/api/addresses/${req.params.id}`, method: "DELETE" });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ADDRESS_MESSAGES.ADDRESS.DELETE_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};