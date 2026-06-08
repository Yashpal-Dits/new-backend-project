import * as ProductRepository from "../repositories/ProductRepository";
import { PRODUCT_MESSAGES } from "../constants/productMessages";
import logger from "../config/logger";
import { logError } from "../middlewares/logger";
import { Product } from "../entities/ProductEntity";
import { getCache,setCache, delCache, delPattern } from "../config/redis";
import type {
  ICreateProductRequest,
  IUpdateProductRequest,
  IProductServiceResponse,
  IProductResponse,
} from "../interfaces/productInterfaces";

//  PRODUCT RESPONSE HELPER 
function mapToResponse(product: Product): IProductResponse {
  return {
    id: product.id,
    store_id: product.store_id,
    name: product.name,
    price: product.price,
    categories_id: product.categories_id,
    stock: product.stock,
    description: product.description || null,
    image: product.image || null,
    sku: product.sku,
    is_active: product.is_active,
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
}

//  CREATE PRODUCT 
export const createProduct = async (
  productData: ICreateProductRequest
): Promise<IProductServiceResponse<IProductResponse>> => {
  try {
    // Check if store exists
    const storeExist = await ProductRepository.storeExists(productData.store_id);
    if (!storeExist) {
      return {
        success: false,
        message: PRODUCT_MESSAGES.PRODUCT.STORE_NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    // Check if category exists
    const categoryExist = await ProductRepository.categoryExists(productData.categories_id);
    if (!categoryExist) {
      return {
        success: false,
        message: PRODUCT_MESSAGES.PRODUCT.CATEGORY_NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    // Check SKU uniqueness
    if (productData.sku) {
      const skuExist = await ProductRepository.skuExists(productData.sku);
      if (skuExist) {
        return {
          success: false,
          message: PRODUCT_MESSAGES.PRODUCT.ALREADY_EXISTS,
          timestamp: new Date().toISOString(),
        };
      }
    }

    logger.info(`Creating product for store ${productData.store_id} and category ${productData.categories_id}`);
    const newProduct = await ProductRepository.createProduct(productData);

    return {
      success: true,
      message: PRODUCT_MESSAGES.PRODUCT.CREATION_SUCCESS,
      data: mapToResponse(newProduct),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "ProductService.createProduct",
      body: productData,
    });
    return {
      success: false,
      message: PRODUCT_MESSAGES.PRODUCT.CREATION_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

// UPDATE PRODUCT 
export const updateProduct = async (
  id: number,
  updateData: IUpdateProductRequest
): Promise<IProductServiceResponse<IProductResponse>> => {
  try {
    const existing = await ProductRepository.findProductById(id);
    if (!existing) {
      return {
        success: false,
        message: PRODUCT_MESSAGES.PRODUCT.NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    // Validate store if provided
    if (updateData.store_id) {
      const storeExist = await ProductRepository.storeExists(updateData.store_id);
      if (!storeExist) {
        return {
          success: false,
          message: PRODUCT_MESSAGES.PRODUCT.STORE_NOT_FOUND,
          timestamp: new Date().toISOString(),
        };
      }
    }

    // Validate category if provided
    if (updateData.categories_id) {
      const categoryExist = await ProductRepository.categoryExists(updateData.categories_id);
      if (!categoryExist) {
        return {
          success: false,
          message: PRODUCT_MESSAGES.PRODUCT.CATEGORY_NOT_FOUND,
          timestamp: new Date().toISOString(),
        };
      }
    }

    // Check SKU uniqueness
    if (updateData.sku) {
      const skuExist = await ProductRepository.skuExists(updateData.sku, id);
      if (skuExist) {
        return {
          success: false,
          message: PRODUCT_MESSAGES.PRODUCT.ALREADY_EXISTS,
          timestamp: new Date().toISOString(),
        };
      }
    }

    //  Update the database
    await ProductRepository.updateProduct(id, updateData);
    await delCache(`products:page1:limit10`);
    logger.info(`Cache invalidated for product ${id}`);

    await delPattern("products:*");
    logger.info(`All product caches invalidated due to update of products ${id}`);


    const updated = await ProductRepository.findProductById(id);
    logger.info(`Updated product ${id} successfully`);
    return {
      success: true,
      message: PRODUCT_MESSAGES.PRODUCT.UPDATE_SUCCESS,
      data: mapToResponse(updated!),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "ProductService.updateProduct",
      body: { id, ...updateData },
    });
    return {
      success: false,
      message: PRODUCT_MESSAGES.PRODUCT.UPDATE_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

// GET  PRODUCT BY ID
export const getProductById = async (id: number): Promise<IProductServiceResponse<IProductResponse>> => {
  try {
    const product = await ProductRepository.findProductById(id);

    if (!product) {
      return {
        success: false,
        message: PRODUCT_MESSAGES.PRODUCT.NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      message: PRODUCT_MESSAGES.PRODUCT.FETCH_SUCCESS,
      data: mapToResponse(product),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "ProductService.getProductById",
      body: { id },
    });
    return {
      success: false,
      message: PRODUCT_MESSAGES.PRODUCT.FETCH_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

//  GET ALL PRODUCT   

export const getAllProducts = async (
  page: number = 1,
  limit: number = 10
): Promise<IProductServiceResponse<any>> => {
  try {

    const cacheKey = `products:page${page}: limit${limit}`;

    const cachedData = await getCache(cacheKey);

    if(cachedData) {
      logger.info(`Cached HIT: Returning from Redis for ${cacheKey}`);

      return JSON.parse(cachedData); // Convert string back to object
    }
    // If Cache failed : Fetch data from Database
    logger.info(`Cache Failed: Fetching products from DB for ${cacheKey}`);
    const skip = (page -1) * limit;
    
    const [products, total] = await ProductRepository.findAllProductsWithPagination(skip, limit);

    const response = {
      success: true,
      message: PRODUCT_MESSAGES.PRODUCT.FETCH_SUCCESS,
      data: {
        products : products.map(mapToResponse),
        pagination: {
          total,
          page,
          limit,
          totalPage: Math.ceil(total/limit),
        },
      },
      timestamp : new Date().toISOString(),
    };

    await setCache(cacheKey, response, 3600);
    return response;

  } catch (error) {
    logError(error as Error, {
      endpoint: "ProductService.getAllProducts",
      body: { page, limit },
    });
    return {
      success: false,
      message: PRODUCT_MESSAGES.PRODUCT.FETCH_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

//  DELETE PRODUCT
export const deleteProduct = async (id: number): Promise<IProductServiceResponse> => {
  try {
    const existing = await ProductRepository.findProductById(id);

    if (!existing) {
      return {
        success: false,
        message: PRODUCT_MESSAGES.PRODUCT.NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    await ProductRepository.deleteProduct(id);

    return {
      success: true,
      message: PRODUCT_MESSAGES.PRODUCT.DELETE_SUCCESS,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "ProductService.deleteProduct",
      body: { id },
    });
    return {
      success: false,
      message: PRODUCT_MESSAGES.PRODUCT.DELETE_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

