import bcrypt from "bcrypt";
import * as userRepo from "../repositories/UserRepository";
import * as otpService from "./OTPService";
import { MESSAGES } from "../constants/messages";
import { UserRole, RegistrationStatus } from "../enums";
import logger from "../config/logger";
import { logError, logAuthEvent } from "../middlewares/logger";
import jwt from "jsonwebtoken";
import type {
  IRegisterRequest,
  IVerifyOTPRequest,
  IAuthServiceResponse,
  IRegisterResponseData,
  INewRegistrationResponse,
  IExistingUserRegistrationData,
  IVerifyOTPResponseData,
  ILoginRequest,
  ILoginResponseData,} from "../interfaces/index"


export const register = async (
  data: IRegisterRequest
): Promise<IAuthServiceResponse<IRegisterResponseData>> => {
  try {
    const userStatus = await userRepo.getUserStatus(data.email);


    if (userStatus.exists && userStatus.isActive) {

      logger.warn(`Registration attempt with existing active email:${data.email}`);
      return {
        success: false,
        message: MESSAGES.AUTH.EMAIL_ALREADY_REGISTERED,
        timestamp: new Date().toISOString(),
      };
    }


    if (userStatus.exists && !userStatus.isActive) {
      logger.info(` User exists but not active, resending OTP for: ${data.email}`);
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
    logger.info(`New user created with ID: ${user.id},email: ${user.email} `);

    const otpResult = await otpService.sendOTP(data.email);

    if (!otpResult.success) {
      logger.warn(`Failed to send the OTP during registration for: ${data.email}`);
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
    logAuthEvent("REGISTER", user.id, user.email, true);
    return {
      success: true,
      message: MESSAGES.AUTH.REGISTRATION_STARTED,
      data: responseData,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "AuthService.register",
      body: { email: data.email },
    });
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
    logger.info(`Email verification attempt for: ${data.email}`);

    const otpResult = await otpService.verifyOTP(data.email, data.otp);

    if (!otpResult.success) {
      logger.warn(`OTP verification failed for: ${data.email}`);
      return {
        success: false,
        message: otpResult.message,
        timestamp: new Date().toISOString(),
      };
    }

    const user = await userRepo.findByEmail(data.email);

    if (!user) {
      logger.warn(`User not found during verification: ${data.email}`);
      return {
        success: false,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    await userRepo.activateUser(user.id);

    logger.info(`User verified and activated: ${user.id} (${user.email})`);
    logAuthEvent("VERIFY_EMAIL", user.id, user.email, true);

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
    logError(error as Error, {
      endpoint: "AuthService.verifyEmail",
      body: { email: data.email },
    });
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
    logger.info(`Resend OTP request for: ${email}`);

    const user = await userRepo.findByEmail(email);

    if (!user) {
      logger.warn(`Resend OTP failed - user not found: ${email}`);
      return {
        success: false,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    logger.debug(`User found: ${email}, active status: ${user.is_active}`);

    if (user.is_active) {
      logger.warn(`Resend OTP rejected - user already active: ${email}`);
      return {
        success: false,
        message: MESSAGES.AUTH.USER_ALREADY_ACTIVE,
        timestamp: new Date().toISOString(),
      };
    }

    logger.info(`Sending new OTP to: ${email}`);
    const result = await otpService.sendOTP(email);

    logger.debug(`OTP send result for ${email}: success=${result.success}`);

    return {
      ...result,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "AuthService.resendOTP",
      body: { email },
    });
    return {
      success: false,
      message: MESSAGES.AUTH.RESEND_OTP_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};

export const login = async (
  data: ILoginRequest
): Promise<IAuthServiceResponse<ILoginResponseData>> => {
  try {
    // Find user by email
    const user = await userRepo.findByEmail(data.email);

    if (!user) {
      logger.warn(`Login attempt for non-existent email: ${data.email}`);
      return {
        success: false,
        message: MESSAGES.AUTH.INVALID_CREDENTIALS,
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Check if user is active (OTP verified)
    if (!user.is_active) {
      logger.warn(`Login attempt for inactive account: ${user.email}`);
      return {
        success: false,
        message: MESSAGES.AUTH.ACCOUNT_NOT_ACTIVATED, 
        timestamp: new Date().toISOString(),
      };
    }

    // 3. Compare passwords
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      logger.warn(`Invalid password attempt for: ${user.email}`);
      logAuthEvent("LOGIN_FAILED", user.id, user.email, false);
      return {
        success: false,
        message: MESSAGES.AUTH.INVALID_CREDENTIALS,
        timestamp: new Date().toISOString(),
      };
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "30m" }
    );

    logger.info(`User logged in successfully: ${user.email}`);
    logAuthEvent("LOGIN_SUCCESS", user.id, user.email, true);

    return {
      success: true,
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, { endpoint: "AuthService.login", body: { email: data.email } });
    return {
      success: false,
      message: MESSAGES.AUTH.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    };
  }
};
