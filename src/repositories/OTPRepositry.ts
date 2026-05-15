import { AppDataSource } from "../config/dataSource";
import { OTP } from "../entities/OTPEntity";

const otpRepository = AppDataSource.getTreeRepository(OTP);

export const saveOTP = async (
    email: string,
    otp: string,
    expires_at:Date
): Promise<OTP> => {
    const otpRecord = otpRepository.create({
        email, 
        otp,
        expires_at: expires_at,
        is_used: false,
        purpose: "registration",
    });
    return otpRepository.save(otpRecord);
};
export const findByEmailAndOTP = async (
    email: string,
    otp: string
): Promise<OTP | null> => {
    return otpRepository.findOne({
        where: {
            email, 
            otp,
            is_used:false,
            purpose: "registration",
        },
    });
};

export const markAsUsed = async (id:number) : Promise<void> => {
    await otpRepository.update(id, {is_used:true})
};

export const deleteOldOTPs = async (email:string): Promise<void> => {
    await otpRepository.delete ({
        email, 
        purpose: "registeration",
    });
};

export const  deleteExpiredOTPs = async (): Promise<void> => {
    await otpRepository
    .createQueryBuilder()
    .delete()
    .where("expires_at < : now", {now: new Date()

    })

.andWhere("purpose = :purpose", {purpose: "registration"})
.execute();
}