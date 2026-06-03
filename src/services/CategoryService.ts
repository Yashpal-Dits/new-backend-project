import * as categoryRepo from "../repositories/CategoryRepository";
import { CATEGORY_MESSAGES } from "../constants/categoryMessages";
import { Category } from "../entities/CategoryEntity";
import logger from "../config/logger";
import { logError } from "../middlewares/logger";
import type {
  ICreateCategoryRequest,
  IUpdateCategoryRequest,
  ICategoryServiceResponse,
  ICategoryResponse,
} from "../interfaces/categoryInterfaces";

// Helper function map Category entity  to response interface
const mapCategoryToResponse = (category: Category): ICategoryResponse => {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
  };
};

export const createCategory = async (
  data: ICreateCategoryRequest
): Promise<ICategoryServiceResponse<ICategoryResponse>> => {
  try {
    logger.info(`Creating category: ${data.name}`);

    const existingCategory = await categoryRepo.findByName(data.name);
    if (existingCategory) {
      logger.warn(`Category already exists: ${data.name}`);
      return {
        success: false,
        message: CATEGORY_MESSAGES.CATEGORY.CATEGORY_ALREADY_EXISTS,
        timestamp: new Date().toISOString(),
      };
    }

   const category = await categoryRepo.createCategory({
      name: data.name,
      description: data.description || null,
    });
    logger.info(`Category created successfully with ID: ${category.id}`);

    return {
      success: true,
      message: CATEGORY_MESSAGES.CATEGORY.CREATED_SUCCESS,
      data: mapCategoryToResponse(category),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "CategoryService.createCategory",
      body: { name: data.name },
    });
    return {
      success: false,
      message: CATEGORY_MESSAGES.CATEGORY.CREATION_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

export const getCategoryById = async (
  id: number
): Promise<ICategoryServiceResponse<ICategoryResponse>> => {
  try {
    logger.info(`Fetching category with ID: ${id}`);

    const category = await categoryRepo.findById(id);

    if (!category) {
      logger.warn(`Category not found with ID: ${id}`);
      return {
        success: false,
        message: CATEGORY_MESSAGES.CATEGORY.CATEGORY_NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      message: CATEGORY_MESSAGES.CATEGORY.FETCHED_SUCCESS,
      data: mapCategoryToResponse(category),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "CategoryService.getCategoryById",
      body: { id },
    });
    return {
      success: false,
      message: CATEGORY_MESSAGES.CATEGORY.FETCH_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

export const getCategoryByName = async (
  name: string
): Promise<ICategoryServiceResponse<ICategoryResponse>> => {
  try {
    logger.info(`Fetching category by name: ${name}`);

    const category = await categoryRepo.findByName(name);

    if (!category) {
      logger.warn(`Category not found with name: ${name}`);
      return {
        success: false,
        message: CATEGORY_MESSAGES.CATEGORY.CATEGORY_NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      message: CATEGORY_MESSAGES.CATEGORY.FETCHED_SUCCESS,
      data: mapCategoryToResponse(category),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "CategoryService.getCategoryByName",
      body: { name },
    });
    return {
      success: false,
      message: CATEGORY_MESSAGES.CATEGORY.FETCH_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

export const getAllCategories = async (): Promise<
  ICategoryServiceResponse<ICategoryResponse[]>
> => {
  try {
    logger.info("Fetching all categories");

    const categories = await categoryRepo.findAll();

    const categoriesResponse: ICategoryResponse[] = categories.map((cat) =>
      mapCategoryToResponse(cat)
    );

    return {
      success: true,
      message: CATEGORY_MESSAGES.CATEGORY.FETCHED_ALL_SUCCESS,
      data: categoriesResponse,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "CategoryService.getAllCategories",
    });
    return {
      success: false,
      message: CATEGORY_MESSAGES.CATEGORY.FETCH_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

export const updateCategory = async (
  id: number,
  data: IUpdateCategoryRequest
): Promise<ICategoryServiceResponse<ICategoryResponse>> => {
  try {
    logger.info(`Updating category with ID: ${id}`);

    const category = await categoryRepo.findById(id);

    if (!category) {
      logger.warn(`Category not found for update with ID: ${id}`);
      return {
        success: false,
        message: CATEGORY_MESSAGES.CATEGORY.CATEGORY_NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    if (data.name && data.name !== category.name) {
      const nameExists = await categoryRepo.nameExists(data.name, id);
      if (nameExists) {
        logger.warn(`Category name already exists: ${data.name}`);
        return {
          success: false,
          message: CATEGORY_MESSAGES.CATEGORY.CATEGORY_ALREADY_EXISTS,
          timestamp: new Date().toISOString(),
        };
      }
    }

    const updateData: Partial<Category> = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;

    await categoryRepo.updateCategory(id, updateData);

    const updatedCategory = await categoryRepo.findById(id);

    if (!updatedCategory) {
      return {
        success: false,
        message: CATEGORY_MESSAGES.CATEGORY.CATEGORY_NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    logger.info(`Category updated successfully with ID: ${id}`);

    return {
      success: true,
      message: CATEGORY_MESSAGES.CATEGORY.UPDATED_SUCCESS,
      data: mapCategoryToResponse(updatedCategory),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "CategoryService.updateCategory",
      body: { id, ...data },
    });
    return {
      success: false,
      message: CATEGORY_MESSAGES.CATEGORY.UPDATE_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

export const deleteCategory = async (
  id: number
): Promise<ICategoryServiceResponse> => {
  try {
    logger.info(`Deleting category with ID: ${id}`);

    const category = await categoryRepo.findById(id);

    if (!category) {
      logger.warn(`Category not found for deletion with ID: ${id}`);
      return {
        success: false,
        message: CATEGORY_MESSAGES.CATEGORY.CATEGORY_NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    const hasProducts = await categoryRepo.hasProducts(id);
    if (hasProducts) {
      logger.warn(`Cannot delete category with products: ${id}`);
      return {
        success: false,
        message: CATEGORY_MESSAGES.CATEGORY.CANNOT_DELETE_WITH_PRODUCTS,
        timestamp: new Date().toISOString(),
      };
    }

    await categoryRepo.deleteCategory(id);

    logger.info(`Category deleted successfully with ID: ${id}`);

    return {
      success: true,
      message: CATEGORY_MESSAGES.CATEGORY.DELETED_SUCCESS,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "CategoryService.deleteCategory",
      body: { id },
    });
    return {
      success: false,
      message: CATEGORY_MESSAGES.CATEGORY.DELETE_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};
