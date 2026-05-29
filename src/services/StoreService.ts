import * as storeRepo from "../repositories/StoreRepository";
import * as userRepo from "../repositories/UserRepository";
import { STORE_MESSAGES } from "../constants/storeMessages";
import logger from "../config/logger";
import { logError } from "../middlewares/logger";
import type {
  ICreateStoreRequest,
  IUpdateStoreRequest,
  IStoreResponse,
  IStoreServiceResponse,
} from "../interfaces/storeInterfaces";
import { Store } from "../entities/StoreEntity";

const mapStoreToResponse = (store: Store): IStoreResponse => ({
  id: store.id,
  user_id: store.user_id,
  store_name: store.store_name,
  description: store.description,
  business_email: store.business_email,
  is_active: store.is_active,
  created_at: store.created_at,
  updated_at: store.updated_at,
});

export const createStore = async (
  data: ICreateStoreRequest
): Promise<IStoreServiceResponse<IStoreResponse>> => {
  try {
    logger.info(`Creating store for user ${data.user_id}`);

    const user = await userRepo.findById(data.user_id);
    if (!user) {
      logger.warn(`User not found for store creation: ${data.user_id}`);
      return {
        success: false,
        message: STORE_MESSAGES.STORE.USER_NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    const existingStore = await storeRepo.findByNameAndUser(data.store_name, data.user_id);
    if (existingStore) {
      logger.warn(`Store already exists for user ${data.user_id}: ${data.store_name}`);
      return {
        success: false,
        message: STORE_MESSAGES.STORE.STORE_ALREADY_EXISTS,
        timestamp: new Date().toISOString(),
      };
    }

    const store = await storeRepo.createStore({
      user_id: data.user_id,
      store_name: data.store_name,
      description: data.description || undefined,
      business_email: data.business_email || undefined,
      is_active: data.is_active ?? true,
    });

    return {
      success: true,
      message: STORE_MESSAGES.STORE.CREATION_SUCCESS,
      data: mapStoreToResponse(store),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "StoreService.createStore",
      body: data,
    });
    return {
      success: false,
      message: STORE_MESSAGES.STORE.CREATION_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

export const getStoreById = async (
  id: number
): Promise<IStoreServiceResponse<IStoreResponse>> => {
  try {
    logger.info(`Fetching store with ID: ${id}`);

    const store = await storeRepo.findById(id);
    if (!store) {
      logger.warn(`Store not found with ID: ${id}`);
      return {
        success: false,
        message: STORE_MESSAGES.STORE.NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      message: STORE_MESSAGES.STORE.FETCH_SUCCESS,
      data: mapStoreToResponse(store),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "StoreService.getStoreById",
      body: { id },
    });
    return {
      success: false,
      message: STORE_MESSAGES.STORE.FETCH_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

export const getAllStores = async (): Promise<
  IStoreServiceResponse<IStoreResponse[]>
> => {
  try {
    logger.info("Fetching all stores");

    const stores = await storeRepo.findAll();
    return {
      success: true,
      message: STORE_MESSAGES.STORE.FETCH_ALL_SUCCESS,
      data: stores.map(mapStoreToResponse),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "StoreService.getAllStores",
    });
    return {
      success: false,
      message: STORE_MESSAGES.STORE.FETCH_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

export const updateStore = async (
  id: number,
  data: IUpdateStoreRequest
): Promise<IStoreServiceResponse<IStoreResponse>> => {
  try {
    logger.info(`Updating store with ID: ${id}`);

    const existingStore = await storeRepo.findById(id);
    if (!existingStore) {
      logger.warn(`Store not found for update: ${id}`);
      return {
        success: false,
        message: STORE_MESSAGES.STORE.NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    if (data.user_id) {
      const user = await userRepo.findById(data.user_id);
      if (!user) {
        return {
          success: false,
          message: STORE_MESSAGES.STORE.USER_NOT_FOUND,
          timestamp: new Date().toISOString(),
        };
      }
    }

    if (data.store_name && data.store_name !== existingStore.store_name) {
      const nameExists = await storeRepo.findByNameAndUser(
        data.store_name,
        data.user_id ?? existingStore.user_id
      );
      if (nameExists && nameExists.id !== id) {
        return {
          success: false,
          message: STORE_MESSAGES.STORE.STORE_ALREADY_EXISTS,
          timestamp: new Date().toISOString(),
        };
      }
    }

    const updatePayload: Partial<Store> = {};
    if (data.user_id) updatePayload.user_id = data.user_id;
    if (data.store_name) updatePayload.store_name = data.store_name;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.business_email !== undefined)
      updatePayload.business_email = data.business_email;
    if (data.is_active !== undefined) updatePayload.is_active = data.is_active;

    await storeRepo.updateStore(id, updatePayload);
    const updatedStore = await storeRepo.findById(id);

    if (!updatedStore) {
      return {
        success: false,
        message: STORE_MESSAGES.STORE.NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      message: STORE_MESSAGES.STORE.UPDATE_SUCCESS,
      data: mapStoreToResponse(updatedStore),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "StoreService.updateStore",
      body: { id, ...data },
    });
    return {
      success: false,
      message: STORE_MESSAGES.STORE.UPDATE_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

export const deleteStore = async (
  id: number
): Promise<IStoreServiceResponse> => {
  try {
    logger.info(`Deleting store with ID: ${id}`);

    const store = await storeRepo.findById(id);
    if (!store) {
      logger.warn(`Store not found for deletion: ${id}`);
      return {
        success: false,
        message: STORE_MESSAGES.STORE.NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    const hasProducts = await storeRepo.hasProducts(id);
    if (hasProducts) {
      logger.warn(`Cannot delete store with products: ${id}`);
      return {
        success: false,
        message: STORE_MESSAGES.STORE.CANNOT_DELETE_WITH_PRODUCTS,
        timestamp: new Date().toISOString(),
      };
    }

    await storeRepo.deleteStore(id);
    return {
      success: true,
      message: STORE_MESSAGES.STORE.DELETE_SUCCESS,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "StoreService.deleteStore",
      body: { id },
    });
    return {
      success: false,
      message: STORE_MESSAGES.STORE.DELETE_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};
