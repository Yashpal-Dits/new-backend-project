import { AppDataSource } from "../config/dataSource";
import { OTP } from "../entities/OTPEntity";
import { OTPPurpose } from "../enums";
import type { IOTP } from "../interfaces";

const otpRepository = AppDataSource.getRepository(OTP);

export const saveOTP = async (
  email: string,
  otp: string,
  expiresAt: Date,
  purpose: OTPPurpose = OTPPurpose.REGISTRATION
): Promise<IOTP> => {
  const otpRecord = otpRepository.create({
    email,
    otp,
    expires_at: expiresAt,
    is_used: false,
    purpose,
  });
  return otpRepository.save(otpRecord);
};


export const findByEmailAndOTP = async (
  email: string,
  otp: string,
  purpose: OTPPurpose = OTPPurpose.REGISTRATION
): Promise<IOTP | null> => {
  return otpRepository.findOne({
    where: {
      email,
      otp,
      is_used: false,
      purpose,
    },
  });
};


export const markAsUsed = async (id: number): Promise<void> => {
  await otpRepository.update(id, { is_used: true });
};


export const deleteOldOTPs = async (
  email: string,
  purpose: OTPPurpose = OTPPurpose.REGISTRATION
): Promise<void> => {
  await otpRepository.delete({
    email,
    purpose,
  });
};
