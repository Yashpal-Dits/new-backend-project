import { User } from "../entities/UserEntity";
import { AppDataSource } from "../config/dataSource";

const userRepository = AppDataSource.getTreeRepository(User);

export const createUser = async (userData: Partial<User>): Promise<User> => {
    const user = userRepository.create(userData);
    return userRepository.save(user);
};

export const findByEmail = async (email: string): Promise<User | null> => {
    return userRepository.findOne({
        where: { email },

    });
};

export const findById = async (id:number): Promise<User | null > => {
     return userRepository.findOneBy({id});

    };
    export const verifyEmail = async (userId: number): Promise<void> => {
        await userRepository.update(userId, {
            is_email_verified: true
        });
    }
  export const emailExists = async(email:string): Promise<boolean> => {
    const user = await userRepository.findOne({
        where : {email}});
        return !! user;
  }

