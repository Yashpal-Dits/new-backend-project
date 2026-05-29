import * as ProductRepository from "../repositories/ProductRepository";
import { PRODUCT_MESSAGES } from "../constants/productMessages";
import type {
  ICreateProductRequest,
  IUpdateProductRequest,
  IProductServiceResponse,
  IProductResponse,
} from "../interfaces/productInterfaces";
import { Product } from "../entities/ProductEntity";

// ==================== CREATE ====================
export const createProduct = async (
  productData: ICreateProductRequest
): Promise<IProductServiceResponse<IProductResponse>> => {
  if (productData.sku) {
    const exists = await ProductRepository.skuExists(productData.sku);
    if (exists) {
      return {
        success: false,
        message: PRODUCT_MESSAGES.PRODUCT.ALREADY_EXISTS,
        timestamp: new Date().toISOString(),
      };
    }
  }

  const newProduct = await ProductRepository.createProduct(productData);

  return {
    success: true,
    message: PRODUCT_MESSAGES.PRODUCT.CREATION_SUCCESS,
    data: mapToResponse(newProduct),
    timestamp: new Date().toISOString(),
  };
};

// ==================== GET BY ID ====================
export const getProductById = async (id: number): Promise<IProductServiceResponse<IProductResponse>> => {
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
};

// ==================== GET ALL (WITH SIMPLE PAGINATION) ====================
export const getAllProducts = async (
  page: number = 1,
  limit: number = 10
): Promise<IProductServiceResponse<any>> => {
  const skip = (page - 1) * limit;

  const [products, total] = await ProductRepository.findAllProductsWithPagination(skip, limit);

  return {
    success: true,
    message: PRODUCT_MESSAGES.PRODUCT.FETCH_SUCCESS,
    data: {
      products: products.map(mapToResponse),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
    timestamp: new Date().toISOString(),
  };
};

// ==================== UPDATE ====================
export const updateProduct = async (
  id: number,
  updateData: IUpdateProductRequest
): Promise<IProductServiceResponse<IProductResponse>> => {
  const existing = await ProductRepository.findProductById(id);

  if (!existing) {
    return {
      success: false,
      message: PRODUCT_MESSAGES.PRODUCT.NOT_FOUND,
      timestamp: new Date().toISOString(),
    };
  }

  if (updateData.sku) {
    const exists = await ProductRepository.skuExists(updateData.sku, id);
    if (exists) {
      return {
        success: false,
        message: PRODUCT_MESSAGES.PRODUCT.ALREADY_EXISTS,
        timestamp: new Date().toISOString(),
      };
    }
  }

  await ProductRepository.updateProduct(id, updateData);
  const updated = await ProductRepository.findProductById(id);

  return {
    success: true,
    message: PRODUCT_MESSAGES.PRODUCT.UPDATE_SUCCESS,
    data: mapToResponse(updated!),
    timestamp: new Date().toISOString(),
  };
};

// ==================== DELETE ====================
export const deleteProduct = async (id: number): Promise<IProductServiceResponse> => {
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
};

// ==================== HELPER ====================
function mapToResponse(product: Product): IProductResponse {
  return {
    id: product.id,
    store_id: product.store_id,
    name: product.name,
    price: product.price,
    categories_id: product.categories_id,
    stock: product.stock,
    sku: product.sku,
    is_active: product.is_active,
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
}