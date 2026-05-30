import { AppDataSource } from "../config/dataSource";
import { Product } from "../entities/ProductEntity";
import { Store } from "../entities/StoreEntity";
import { Category } from "../entities/CategoryEntity";


const productRepository = AppDataSource.getRepository(Product);

export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  const product = productRepository.create(productData);
  return productRepository.save(product);
};

export const findProductById = async (id: number): Promise<Product | null> => {
  return productRepository.findOne({
    where: { id },
    relations: ["store", "category"],
  });
};

export const findAllProductsWithPagination = async (
  skip: number,
  limit: number
): Promise<[Product[], number]> => {
  return productRepository.findAndCount({
    skip,
    take: limit,
    order: { created_at: "DESC" },
    relations: ["store", "category"],
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


export const storeExists = async (storeId: number): Promise<boolean> => {
  const storeRepo = AppDataSource.getRepository(Store);
  const store = await storeRepo.findOneBy({ id: storeId });
  return !!store;
};

export const categoryExists = async (categoryId: number): Promise<boolean> => {
  const categoryRepo = AppDataSource.getRepository(Category);
  const category = await categoryRepo.findOneBy({ id: categoryId });
  return !!category;
};