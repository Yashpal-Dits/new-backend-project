import bcrypt from "bcrypt";
import * as userRepo from "../repositories/UserRepository";
import * as otpService from "./OTPService";
import { MESSAGES } from "../constants/messages";
import { UserRole, RegistrationStatus } from "../enums";
import type {
  IRegisterRequest,
  IVerifyOTPRequest,
  IAuthServiceResponse,
  IRegisterResponseData,
  INewRegistrationResponse,
  IExistingUserRegistrationData,
  IVerifyOTPResponseData,
} from "../interfaces";


export const register = async (
  data: IRegisterRequest
): Promise<IAuthServiceResponse<IRegisterResponseData>> => {
  try {
    const userStatus = await userRepo.getUserStatus(data.email);

  
    if (userStatus.exists && userStatus.isActive) {
      return {
        success: false,
        message: MESSAGES.AUTH.EMAIL_ALREADY_REGISTERED,
        timestamp: new Date().toISOString(),
      };
    }

    
    if (userStatus.exists && !userStatus.isActive) {
      console.log(` User exists but not active, resending OTP...`);
      await otpService.sendOTP(data.email);

      const responseData: IExistingUserRegistrationData = {
        email: data.email,
        status: RegistrationStatus.PARTIAL_REGISTRATION,
      };

      return {
        success: true,
        message: MESSAGES.AUTH.REGISTRATION_PARTIAL,
        data: responseData,
        timestamp: new Date().toISOString(),
      };
    }

  
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await userRepo.createUser({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: hashedPassword,
      role: UserRole.CUSTOMER,
      is_email_verified: false,
      is_active: false,
    });

    const otpResult = await otpService.sendOTP(data.email);

    if (!otpResult.success) {
      return {
        success: false,
        message: otpResult.message,
        timestamp: new Date().toISOString(),
      };
    }

    const responseData: INewRegistrationResponse = {
      userId: user.id,
      email: user.email,
      status: RegistrationStatus.PENDING_VERIFICATION,
    };

    return {
      success: true,
      message: MESSAGES.AUTH.REGISTRATION_STARTED,
      data: responseData,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: MESSAGES.AUTH.REGISTRATION_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};


export const verifyEmail = async (
  data: IVerifyOTPRequest
): Promise<IAuthServiceResponse<IVerifyOTPResponseData>> => {
  try {
    const otpResult = await otpService.verifyOTP(data.email, data.otp);

    if (!otpResult.success) {
      return {
        success: false,
        message: otpResult.message,
        timestamp: new Date().toISOString(),
      };
    }

    const user = await userRepo.findByEmail(data.email);

    if (!user) {
      return {
        success: false,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    await userRepo.activateUser(user.id);

    const responseData: IVerifyOTPResponseData = {
      userId: user.id,
      email: user.email,
      isActive: true,
      verified: true,
    };

    return {
      success: true,
      message: MESSAGES.AUTH.OTP_VERIFIED,
      data: responseData,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Verification error:", error);
    return {
      success: false,
      message: MESSAGES.AUTH.OTP_VERIFICATION_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

export const resendOTP = async (
  email: string
): Promise<IAuthServiceResponse> => {
  try {
    console.log(`Resend OTP request for: ${email}`);

    const user = await userRepo.findByEmail(email);

    if (!user) {
      console.log(` User not found: ${email}`);
      return {
        success: false,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    console.log(`User found, active status: ${user.is_active}`);

    if (user.is_active) {
      console.log(`  User already active: ${email}`);
      return {
        success: false,
        message: MESSAGES.AUTH.USER_ALREADY_ACTIVE,
        timestamp: new Date().toISOString(),
      };
    }

    console.log(` Sending new OTP...`);
    const result = await otpService.resendOTP(email);

    console.log(`OTP sent result:`, result);

    return {
      ...result,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(" Resend OTP error:", error);
    return {
      success: false,
      message: MESSAGES.AUTH.RESEND_OTP_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};