import { AppDataSource } from "../config/dataSource";
import { Category } from "../entities/CategoryEntity";

const categoryRepository = AppDataSource.getRepository(Category);

export const createCategory = async (
  categoryData: Partial<Category>
): Promise<Category> => {
  const category = categoryRepository.create(categoryData);
  return categoryRepository.save(category);
};

export const findById = async (id: number): Promise<Category | null> => {
  return categoryRepository.findOneBy({ id });
};

export const findByName = async (name: string): Promise<Category | null> => {
  return categoryRepository.findOneBy({ name });
};

export const findAll = async (): Promise<Category[]> => {
  return categoryRepository.find();
};

export const updateCategory = async (
  id: number,
  updateData: Partial<Category>
): Promise<void> => {
  await categoryRepository.update(id, updateData);
};

export const deleteCategory = async (id: number): Promise<void> => {
  await categoryRepository.delete(id);
};

export const categoryExists = async (id: number): Promise<boolean> => {
  const category = await categoryRepository.findOneBy({ id });
  return !!category;
};

export const nameExists = async (
  name: string,
  excludeId?: number
): Promise<boolean> => {
  const category = await categoryRepository.findOne({
    where: { name },
  });

  // No category found
  if (!category) {
    return false;
  }

  // During update, ignore same category
  if (excludeId && category.id === excludeId) {
    return false;
  }

  return true;
};

export const hasProducts = async (categoryId: number): Promise<boolean> => {
  const category = await categoryRepository.findOne({
    where: { id: categoryId },
    relations: ["products"],
  });

  if (!category || !category.products) {
    return false;
  }

  return category.products.length > 0;
};