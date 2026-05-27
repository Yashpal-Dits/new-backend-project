
import { AppDataSource } from "../config/dataSource";
import { User } from "../entities/UserEntity";
import type { IUserStatus, ICreateUserResponse } from "../interfaces";

const userRepository = AppDataSource.getRepository(User);

export const createUser = async (
  userData: Partial<User>
): Promise<ICreateUserResponse> => {
  const user = userRepository.create(userData);
  const savedUser = await userRepository.save(user);
  return {
    id: savedUser.id,
    email: savedUser.email,
    first_name: savedUser.first_name,
    last_name: savedUser.last_name,
  };
};

export const findByEmail = async (email: string): Promise<User | null> => {
  return userRepository.findOne({
    where: { email },
  });
};

export const findById = async (id: number): Promise<User | null> => {
  return userRepository.findOneBy({ id });
};

export const verifyEmail = async (userId: number): Promise<void> => {
  await userRepository.update(userId, { is_email_verified: true });
};

export const activateUser = async (userId: number): Promise<void> => {
  await userRepository.update(userId, {
    is_email_verified: true,
    is_active: true,
  });
};

export const emailExists = async (email: string): Promise<boolean> => {
  const user = await userRepository.findOne({ where: { email } });
  return !!user;
};

export const getUserStatus = async (email: string): Promise<IUserStatus> => {
  const user = await userRepository.findOne({ where: { email } });

  if (!user) {
    return {
      exists: false,
      isEmailVerified: false,
      isActive: false,
    };
  }

  return {
    exists: true,
    isEmailVerified: user.is_email_verified,
    isActive: user.is_active,
  };
};

export const updatePassword = async (
  userId: number,
  hashedPassword: string
): Promise<void> => {
  await userRepository.update(userId, {
    password: hashedPassword,
  });
};

export const findByIdWithPassword = async(id : number) :Promise<User| null> => {
  return userRepository.findOne({
    where : {id},
    select:[
      "id", 
      "email",
      "password",
      "first_name",
      "last_name",
      "is_active",
      "role"
    ],
  });
};