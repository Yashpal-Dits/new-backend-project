import { Request, Response } from "express";
import * as ProductService from "../services/ProductService";
import { PRODUCT_MESSAGES } from "../constants/productMessages";
import { HttpStatusCode } from "../enums";
import logger from "../config/logger";
import { logError } from "../middlewares/logger";
import type {
  ICreateProductRequest,
  IUpdateProductRequest,
} from "../interfaces/productInterfaces";

export const createProduct = async (req: Request, res: Response): Promise<Response> => {
  try {
    const productData: ICreateProductRequest = req.body;
    logger.info(`Creating product: ${productData.name}`);

    const result = await ProductService.createProduct(productData);
    return res
      .status(result.success ? HttpStatusCode.CREATED : HttpStatusCode.BAD_REQUEST)
      .json(result);
  } catch (error) {
    logError(error as Error, { endpoint: "/api/products", method: "POST", body: req.body });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: PRODUCT_MESSAGES.PRODUCT.CREATION_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    logger.info(`Fetching product with ID: ${id}`);

    const result = await ProductService.getProductById(Number(id));
    return res
      .status(result.success ? HttpStatusCode.OK : HttpStatusCode.NOT_FOUND)
      .json(result);
  } catch (error) {
    logError(error as Error, { endpoint: `/api/products/${req.params.id}`, method: "GET" });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: PRODUCT_MESSAGES.PRODUCT.FETCH_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};

export const getAllProducts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    logger.info(`Fetching products - Page: ${page}, Limit: ${limit}`);

    const result = await ProductService.getAllProducts(page, limit);
    return res.status(HttpStatusCode.OK).json(result);
  } catch (error) {
    logError(error as Error, { endpoint: "/api/products", method: "GET" });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: PRODUCT_MESSAGES.PRODUCT.FETCH_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateData: IUpdateProductRequest = req.body;
    logger.info(`Updating product with ID: ${id}`);

    const result = await ProductService.updateProduct(Number(id), updateData);
    return res
      .status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST)
      .json(result);
  } catch (error) {
    logError(error as Error, { endpoint: `/api/products/${req.params.id}`, method: "PUT", body: req.body });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: PRODUCT_MESSAGES.PRODUCT.UPDATE_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    logger.info(`Deleting product with ID: ${id}`);

    const result = await ProductService.deleteProduct(Number(id));
    return res
      .status(result.success ? HttpStatusCode.OK : HttpStatusCode.NOT_FOUND)
      .json(result);
  } catch (error) {
    logError(error as Error, { endpoint: `/api/products/${req.params.id}`, method: "DELETE" });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: PRODUCT_MESSAGES.PRODUCT.DELETE_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};