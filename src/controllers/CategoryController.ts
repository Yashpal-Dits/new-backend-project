import { Request, Response } from "express";
import * as CategoryService from "../services/CategoryService";
import { CATEGORY_MESSAGES } from "../constants/categoryMessages";
import { HttpStatusCode } from "../enums";
import logger from "../config/logger";
import { logError } from "../middlewares/logger";
import type {
    ICreateCategoryRequest,
    IUpdateCategoryRequest,
} from "../interfaces/categoryInterfaces";


export const createCategory = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const categoryData: ICreateCategoryRequest = req.body;

        logger.info(`Creating category:${categoryData.name}`);
        
        const result = await CategoryService.createCategory(categoryData)
        return res.status(result.success ? HttpStatusCode.CREATED : HttpStatusCode.BAD_REQUEST).json(result);
    } catch (error) {
        logError(error as Error, {
            endpoint: "/api/categories",
            method: "POST",
            body: req.body,
        });
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: CATEGORY_MESSAGES.CATEGORY.CREATION_FAILED,
            timestamp: new Date().toISOString,
        });
    }
};
export const getCategoryById = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { id } = req.params;
        logger.info(`Fetching category with ID: ${id}`);
        const result = await CategoryService.getCategoryById(Number(id));
        return res.status(result.success ? HttpStatusCode.OK : HttpStatusCode.NOT_FOUND)
            .json(result);
    } catch (error) {
        logError(error as Error, {
            endpoint: `api/categories/${req.params.id}`,
            method: "GET",
        });
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: CATEGORY_MESSAGES.CATEGORY.FETCH_FAILED,
            timestamp: new Date().toISOString(),
        });
    }
};

export const getCategoryByName = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { name } = req.params;
        logger.info(`Fetching category by name: ${name}`);

        const result = await CategoryService.getCategoryByName(name as string );
        return res
            .status(result.success ? HttpStatusCode.OK : HttpStatusCode.NOT_FOUND)
            .json(result);

    } catch (error) {
        logError(error as Error, {
            endpoint: `api/categories/name/${req.params.name}`,
            method: "GET",
        });
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: CATEGORY_MESSAGES.CATEGORY.FETCH_FAILED,
            timestamp: new Date().toISOString(),

        });
    }
};


export const getAllCategories = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    logger.info("Fetching all categories");

    const result = await CategoryService.getAllCategories();

    return res.status(HttpStatusCode.OK).json(result);
  } catch (error) {
    logError(error as Error, {
      endpoint: "/api/categories",
      method: "GET",
    });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: CATEGORY_MESSAGES.CATEGORY.FETCH_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};

export const updateCategory = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { id } = req.params;
        const updateData: IUpdateCategoryRequest = req.body;

        logger.info(`Updating category with ID : ${id}`);

        const result = await CategoryService.updateCategory(Number(id), updateData);

        return res.status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST)
            .json(result);
    } catch (error) {
        logError(error as Error, {
            endpoint: `api/categories/${req.params.id}`,
            method: "PUT",
            body: req.body,
        });
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: CATEGORY_MESSAGES.CATEGORY.UPDATE_FAILED,
            timestamp: new Date().toDateString(),
        });
    }
};

export const deleteCategory = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { id } = req.params;
        logger.info(`Deleting category with ID : ${id}`);

        const result = await CategoryService.deleteCategory(Number(id));
        return res
            .status(result.success ? HttpStatusCode.OK : HttpStatusCode.NOT_FOUND)
            .json(result);
    } catch (error) {
        logError(error as Error, {
            endpoint: `/api/categories/${req.params.id}`,
            method: "DELETE"
        });
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: CATEGORY_MESSAGES.CATEGORY.DELETE_FAILED,
            timestamp: new Date().toISOString(),
        });
    }
};

export const checkCategoryExists = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    logger.info(`Checking if category exists with ID: ${id}`);

    const result = await CategoryService.checkCategoryExists(Number(id));

    return res.status(HttpStatusCode.OK).json(result);
  } catch (error) {
    logError(error as Error, {
      endpoint: `/api/categories/${req.params.id}/exists`,
      method: "GET",
    });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: CATEGORY_MESSAGES.CATEGORY.FETCH_FAILED,
      timestamp: new Date().toISOString(),
    });
  }
};