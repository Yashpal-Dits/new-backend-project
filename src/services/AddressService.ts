import * as AddressRepository from "../repositories/AddressRepository";
import { ADDRESS_MESSAGES } from "../constants/addressMessages";
import logger from "../config/logger";
import { logError } from "../middlewares/logger";
import type {
  ICreateAddressRequest,
  IUpdateAddressRequest,
  IAddressServiceResponse,
  IAddressResponse,
} from "../interfaces/addressInterfaces";
import { Address } from "../entities/AddressEntity";

const mapToResponse = (address: Address): IAddressResponse => {
  return {
    id: address.id,
    user_id: address.user_id,
    address_line: address.address_line,
    city: address.city,
    state: address.state,
    zip_code: address.zip_code,
    country: address.country,
    created_at: address.created_at,
    updated_at: address.updated_at,
  };
};

export const createAddress = async (
  userId: number,
  addressData: ICreateAddressRequest
): Promise<IAddressServiceResponse<IAddressResponse>> => {
  try {
    logger.info(`Service: Creating address for user ${userId}`);
    
    const newAddress = await AddressRepository.createAddress({
      ...addressData,
      user_id: userId,
    });

    logger.info(` Address created successfully for user ${userId}`);
    return {
      success: true,
      message: ADDRESS_MESSAGES.ADDRESS.CREATION_SUCCESS,
      data: mapToResponse(newAddress),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, { endpoint: "AddressService.createAddress", body: { userId, ...addressData } });
    return {
      success: false,
      message: ADDRESS_MESSAGES.ADDRESS.CREATION_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

export const getAddresses = async (userId: number): Promise<IAddressServiceResponse<IAddressResponse[]>> => {
  try {
    logger.info(`Fetching addresses for user ${userId}`);
    
    const addresses = await AddressRepository.findAddressesByUserId(userId);
    
    logger.info(`Retrieved ${addresses.length} addresses for user ${userId}`);
    return {
      success: true,
      message: ADDRESS_MESSAGES.ADDRESS.FETCH_SUCCESS,
      data: addresses.map(mapToResponse),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, { endpoint: "AddressService.getAddresses", body: { userId } });
    return {
      success: false,
      message: ADDRESS_MESSAGES.ADDRESS.FETCH_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

export const updateAddress = async (
  userId: number,
  addressId: number,
  updateData: IUpdateAddressRequest
): Promise<IAddressServiceResponse<IAddressResponse>> => {
  try {
    logger.info(`Updating address ${addressId} for user ${userId}`);
    
    const address = await AddressRepository.findAddressById(addressId);

    if (!address) {
      logger.warn(` Address ${addressId} not found for update`);
      return {
        success: false,
        message: ADDRESS_MESSAGES.ADDRESS.NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    if (address.user_id !== userId) {
      logger.warn(` Unauthorized update attempt on address ${addressId} by user ${userId}`);
      return {
        success: false,
        message: ADDRESS_MESSAGES.ADDRESS.UNAUTHORIZED,
        timestamp: new Date().toISOString(),
      };
    }

    await AddressRepository.updateAddress(addressId, updateData);
    const updatedAddress = await AddressRepository.findAddressById(addressId);

    logger.info(`Address ${addressId} updated successfully`);
    return {
      success: true,
      message: ADDRESS_MESSAGES.ADDRESS.UPDATE_SUCCESS,
      data: updatedAddress ? mapToResponse(updatedAddress) : undefined,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, { endpoint: "AddressService.updateAddress", body: { userId, addressId, ...updateData } });
    return {
      success: false,
      message: ADDRESS_MESSAGES.ADDRESS.UPDATE_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

export const deleteAddress = async (
  userId: number,
  addressId: number
): Promise<IAddressServiceResponse> => {
  try {
    logger.info(` Deleting address ${addressId} for user ${userId}`);
    
    const address = await AddressRepository.findAddressById(addressId);

    if (!address) {
      logger.warn(`Address ${addressId} not found for deletion`);
      return {
        success: false,
        message: ADDRESS_MESSAGES.ADDRESS.NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    if (address.user_id !== userId) {
      logger.warn(` Unauthorized delete attempt on address ${addressId} by user ${userId}`);
      return {
        success: false,
        message: ADDRESS_MESSAGES.ADDRESS.UNAUTHORIZED,
        timestamp: new Date().toISOString(),
      };
    }

    await AddressRepository.deleteAddress(addressId);
    
    logger.info( `Address ${addressId} deleted successfully`);
    return {
      success: true,
      message: ADDRESS_MESSAGES.ADDRESS.DELETE_SUCCESS,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, { endpoint: "AddressService.deleteAddress", body: { userId, addressId } });
    return {
      success: false,
      message: ADDRESS_MESSAGES.ADDRESS.DELETE_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};