import bcrypt from "bcrypt";
import * as userRepo from "../repositories/UserRepository";
import * as otpService from "./OTPService";
import { MESSAGES } from "../constants/messages";
import { UserRole, RegistrationStatus, OTPPurpose} from "../enums";
import { sendPasswordResetSuccessEmail } from "./EmailService";
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
  ILoginResponseData,
  IForgotPasswordRequest,
  IResetPasswordRequest,
  IChangePasswordRequest,
  IForgotPasswordResponse,
  IPasswordResetResponse,} from "../interfaces/authInterfaces"

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

    // 2. Check if user is active 
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


export const forgotPassword = async (
  data: IForgotPasswordRequest
): Promise<IAuthServiceResponse<IForgotPasswordResponse>> => {
  try {
    logger.info(`Forgot password request for: ${data.email}`);

    const user = await userRepo.findByEmail(data.email);
    if (!user) {
      
      logger.warn(`Forgot password for non-existent email: ${data.email}`);
      return {
        success: true,
        message: MESSAGES.AUTH.FORGOT_PASSWORD_OTP_SENT,
        data: {
          email: data.email,
          message:
            "If your email exists in our system, you will receive an OTP.",
        },
        timestamp: new Date().toISOString(),
      };
    }

    logger.info(`Sending forgot password OTP to: ${data.email}`);
    const otpResult = await otpService.sendForgotPasswordOTP(
      data.email
    );

    if (!otpResult.success) {
      logger.error(
        `Failed to send forgot password OTP to: ${data.email}`
      );
      return {
        success: false,
        message: otpResult.message,
        timestamp: new Date().toISOString(),
      };
    }

    logAuthEvent("FORGOT_PASSWORD_REQUEST", user.id, user.email, true);

    return {
      success: true,
      message: otpResult.message,
      data: {
        email: data.email,
        message:
          "An OTP has been sent to your email. Use it to reset your password.",
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "AuthService.forgotPassword",
      body: { email: data.email },
    });
    return {
      success: false,
      message: MESSAGES.AUTH.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    };
  }
};


export const resetPassword = async (
  data: IResetPasswordRequest
): Promise<IAuthServiceResponse<IPasswordResetResponse>> => {
  try {
    logger.info(`Password reset attempt for: ${data.email}`);

    const user = await userRepo.findByEmail(data.email);
    if (!user) {
      logger.warn(`Password reset for non-existent email: ${data.email}`);
      return {
        success: false,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    // Verify OTP for password reset
    const otpResult = await otpService.verifyOTP(
      data.email,
      data.otp,
      OTPPurpose.PASSWORD_RESET
    );

    if (!otpResult.success) {
      logger.warn(
        `Invalid OTP for password reset: ${data.email}`
      );
      return {
        success: false,
        message: otpResult.message,
        timestamp: new Date().toISOString(),
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Update password
    await userRepo.updatePassword(user.id, hashedPassword);

    logger.info(`Password reset successfully for: ${data.email}`);

    // Send success email
    await sendPasswordResetSuccessEmail(
      user.email,
      user.first_name
    );

    logAuthEvent("PASSWORD_RESET_SUCCESS", user.id, user.email, true);

    return {
      success: true,
      message: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS,
      data: {
        email: user.email,
        message: "Your password has been reset successfully.",
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "AuthService.resetPassword",
      body: { email: data.email },
    });
    return {
      success: false,
      message: MESSAGES.AUTH.PASSWORD_RESET_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};


export const changePassword = async (
  userId: number,
  data: IChangePasswordRequest
): Promise<IAuthServiceResponse> => {
  try {
    logger.info(`Change password request for user ID: ${userId}`);

    // Find user with password
    const user = await userRepo.findByIdWithPassword(userId);
    if (!user) {
      logger.warn(`User not found for password change: ${userId}`);
      return {
        success: false,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      data.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      logger.warn(
        `Invalid current password for user: ${user.email}`
      );
      return {
        success: false,
        message: MESSAGES.AUTH.OLD_PASSWORD_INCORRECT,
        timestamp: new Date().toISOString(),
      };
    }

    // Check if new password matches confirm password
    if (data.newPassword !== data.confirmPassword) {
      logger.warn(`Passwords do not match for user: ${user.email}`);
      return {
        success: false,
        message: MESSAGES.VALIDATION.PASSWORDS_NOT_MATCH,
        timestamp: new Date().toISOString(),
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Update password
    await userRepo.updatePassword(userId, hashedPassword);

    logger.info(`Password changed successfully for user: ${user.email}`);

    // Send success email
    await sendPasswordResetSuccessEmail(
      user.email,
      user.first_name
    );

    logAuthEvent("CHANGE_PASSWORD_SUCCESS", userId, user.email, true);

    return {
      success: true,
      message: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "AuthService.changePassword",
      body: { userId },
    });
    return {
      success: false,
      message: MESSAGES.AUTH.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    };
  }
};

export const logout = async (
  userId: number
): Promise<IAuthServiceResponse> => {
  try {
    logger.info(`Logout request for user ID: ${userId}`);

    const user = await userRepo.findById(userId);
    if (!user) {
      logger.warn(`User not found for logout: ${userId}`);
      return {
        success: false,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    logger.info(`User logged out successfully: ${user.email}`);
    logAuthEvent("LOGOUT", userId, user.email, true);

    return {
      success: true,
      message: MESSAGES.AUTH.LOGOUT_SUCCESS,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "AuthService.logout",
      body: { userId },
    });
    return {
      success: false,
      message: MESSAGES.AUTH.LOGOUT_FAILED,
      timestamp: new Date().toISOString(),
    };
  }
};
