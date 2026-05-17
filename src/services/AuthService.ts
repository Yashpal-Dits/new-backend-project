import bcrypt from "bcrypt";
import * as userRepo from "../repositories/UserRepository";
import * as otpService from "./OTPService";

export const register = async (data: any): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
        const emailExists = await userRepo.emailExists(data.email);

        if (emailExists) {
            const existingUser = await userRepo.findByEmail(data.email);
            if (existingUser?.is_email_verified) {
                return {
                    success: false,
                    message: "Email already registered and veriffied",
                };
            }
        }

        const hashpassword = await bcrypt.hash(data.password, 10);
        const user = await userRepo.createUser({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            password: hashpassword,
            is_email_verified: false,
        });

        const otpResult = await otpService.sendOTP(data.email);
        if (!otpResult.success) {
            return {
                success: false,
                message: otpResult.message,
            };
        }
        return {
            success: true,
            message: "Registeration successsful. OTP sent to your email.",
            data: {
                userId: user.id,
                email: user.email,
            },
        };
    } catch (error) {
        console.error("Registeration error:", error);
        return {
            success: false,
            message: "Registration failed",
        };
    }
};

export const verifyEmail = async (data: any): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
        const otpResult = await otpService.verifyOTP(data.email, data.otp);

        if (!otpResult.success) {
            return {
                success: false,
                message: otpResult.message,
            };
        }

        const user = await userRepo.findByEmail(data.email);
        if (!user) {
            return {
                success: false,
                message: "User not found",
            };
        }

        await userRepo.verifyEmail(user.id);

        return {
            success: true,
            message: "Email verified successfully. Your account is now active.",

            data: {
                userId: user?.id,
                email: user.email,
                verified: true,
            },
        };
    } catch (error) {
        console.error("Verification error:", error);

        return {
            success: false,
            message: "Verification failed",
        };
    }
};

export const resendOTP = async (email:string):Promise<{success:boolean; message: string}> => {
    try {
        const user = await userRepo.findByEmail(email);

        if (!user) {
            return {
                success:  false,
                message: 'User not found',
            };
        }

        if(user.is_email_verified) {
            return {
                success:false,
                message: "Email is already verified",
            };
        }

        return otpService.resendOTP(email);
    } catch (error) {
        console.error("Resend OTP error:", error);
        return {
            success: false,
            message: "Failed to resend  the OTP",
        };
    }
};
