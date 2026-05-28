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
import { http } from "winston";

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
        logger.info(`Fethcing category by name:${name}`);

        const result = await CategoryService.getCategoryByName("name");
        return res
            .status(result.success ? HttpStatusCode.OK : HttpStatusCode.NOT_FOUND)
            .json(result);

    } catch (error) {
        logError(error as Error, {
            endpoint: `api/categories/name/${req.params.name}`,
            method: "GET"
        });
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: CATEGORY_MESSAGES.CATEGORY.FETCH_FAILED,
            timestamp: new Date().toISOString(),

        });
    }

    ;
}