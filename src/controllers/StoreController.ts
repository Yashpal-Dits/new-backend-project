import { Request, Response } from "express";
import * as StoreService from "../services/StoreService";
import { STORE_MESSAGES } from "../constants/storeMessages";
import { HttpStatusCode } from "../enums";
import logger from "../config/logger";
import { logError } from "../middlewares/logger";
import type {
  ICreateStoreRequest,
  IUpdateStoreRequest,
} from "../interfaces/storeInterfaces";

export const createStore = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const storeData: ICreateStoreRequest = req.body;
    logger.info(`Creating store: ${storeData.store_name}`);

    const result = await StoreService.createStore(storeData);
    return res
      .status(result.success ? HttpStatusCode.CREATED : HttpStatusCode.BAD_REQUEST)
      .json(result);
      
  } catch (error) {
    logError(error as Error, {
      endpoint: "/api/stores",
      method: "POST",
      body: req.body,
    });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: STORE_MESSAGES.STORE.CREATION_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};

export const getStoreById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    logger.info(`Fetching store with ID: ${id}`);

    const result = await StoreService.getStoreById(Number(id));
    return res
      .status(result.success ? HttpStatusCode.OK : HttpStatusCode.NOT_FOUND)
      .json(result);
  } catch (error) {
    logError(error as Error, {
      endpoint: `/api/stores/${req.params.id}`,
      method: "GET",
    });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: STORE_MESSAGES.STORE.FETCH_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};

export const getAllStores = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    logger.info("Fetching all stores");

    const result = await StoreService.getAllStores();
    return res.status(HttpStatusCode.OK).json(result);
  } catch (error) {
    logError(error as Error, {
      endpoint: "/api/stores",
      method: "GET",
    });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: STORE_MESSAGES.STORE.FETCH_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};

export const updateStore = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateData: IUpdateStoreRequest = req.body;
    logger.info(`Updating store with ID: ${id}`);

    const result = await StoreService.updateStore(Number(id), updateData);
    return res
      .status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST)
      .json(result);
  } catch (error) {
    logError(error as Error, {
      endpoint: `/api/stores/${req.params.id}`,
      method: "PUT",
      body: req.body,
    });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: STORE_MESSAGES.STORE.UPDATE_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};

export const deleteStore = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    logger.info(`Deleting store with ID: ${id}`);

    const result = await StoreService.deleteStore(Number(id));
    return res
      .status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST)
      .json(result);
  } catch (error) {
    logError(error as Error, {
      endpoint: `/api/stores/${req.params.id}`,
      method: "DELETE",
    });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: STORE_MESSAGES.STORE.DELETE_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};
