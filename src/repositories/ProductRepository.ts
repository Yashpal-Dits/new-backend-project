import { AppDataSource } from "../config/dataSource";
import { Product } from "../entities/ProductEntity";

const productRepository = AppDataSource.getRepository(Product);

export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  const product = productRepository.create(productData);
  return productRepository.save(product);
};

export const findProductById = async (id: number): Promise<Product | null> => {
  return productRepository.findOneBy({ id });
};


export const findAllProductsWithPagination = async (
  skip: number,
  limit: number
): Promise<[Product[], number]> => {
  return productRepository.findAndCount({
    skip,
    take: limit,
    order: { created_at: "DESC" },
  });
};

export const updateProduct = async (id: number, updateData: Partial<Product>): Promise<void> => {
  await productRepository.update(id, updateData);
};

export const deleteProduct = async (id: number): Promise<void> => {
  await productRepository.delete(id);
};

export const skuExists = async (sku: string, excludeId?: number): Promise<boolean> => {
  const product = await productRepository.findOne({ where: { sku } });
  if (!product) return false;
  if (excludeId && product.id === excludeId) return false;
  return true;
};