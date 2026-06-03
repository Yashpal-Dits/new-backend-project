import { AppDataSource } from "../config/dataSource";
import { Address } from "../entities/AddressEntity";

const addressRepository = AppDataSource.getRepository(Address);

export const createAddress = async (addressData: Partial<Address>):Promise<Address> => {
    const address = addressRepository.create(addressData);
    return addressRepository.save(address);
};

export const findAddressById  = async(id: number): Promise<Address| null> => {
    return  addressRepository.findOne({where : {id}});
};

export const findAddressesByUserId = async(userId:number) : Promise<Address[]> => {
    return addressRepository.find({where: {user_id : userId}});
} 

export const updateAddress = async(id:number, updateData: Partial<Address>): Promise<void> => {
    await addressRepository.update(id, updateData);
}

export const deleteAddress = async (id :number) : Promise<void>=> {
    await addressRepository.delete(id);
}