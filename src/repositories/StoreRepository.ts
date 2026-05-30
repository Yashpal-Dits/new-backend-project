import { AppDataSource } from "../config/dataSource";
import { Store } from "../entities/StoreEntity";

const storeRepository = AppDataSource.getRepository(Store);

export const createStore = async (storeData: Partial<Store>): Promise<Store> => {
  const store = storeRepository.create(storeData);
  return storeRepository.save(store);
};

export const findById = async (id: number): Promise<Store | null> => {
  return storeRepository.findOneBy({ id });
};

export const findAll = async (): Promise<Store[]> => {
  return storeRepository.find({ order: { created_at: "DESC" } });
};

export const updateStore = async (
  id: number,
  updateData: Partial<Store>
): Promise<void> => {
  await storeRepository.update(id, updateData);
};

export const deleteStore = async (id: number): Promise<void> => {
  await storeRepository.delete(id);
};

export const findByNameAndUser = async (
  storeName: string,
  userId: number
): Promise<Store | null> => {
  return storeRepository.findOne({ where: { store_name: storeName, user_id: userId } });
};

export const storeExists = async (id: number): Promise<boolean> => {
  const store = await storeRepository.findOneBy({ id });
  return !!store;
};

export const hasProducts = async (storeId: number): Promise<boolean> => {
  const store = await storeRepository.findOne({
    where: { id: storeId },
    relations: ["products"],
  });

  if (!store || !store.products) {
    return false;
  }

  return store.products.length > 0;
};
