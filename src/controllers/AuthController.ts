import { Request, Response } from "express";
import * as authService from "../services/AuthService";
import { MESSAGES } from "../constants/messages";
import { HttpStatusCode } from "../enums";
import logger from "../config/logger";
import { logAuthEvent, logError } from "../middlewares/logger";
import type {
  IRegisterRequest,
  IVerifyOTPRequest,
  ILoginRequest,
  IResendOTPRequest,
  IForgotPasswordRequest,
  IResetPasswordRequest,
  IChangePasswordRequest,
  IAuthServiceResponse,
  IRegisterResponseData,
  IVerifyOTPResponseData,
  ILoginResponseData,
  IForgotPasswordResponse,
  IResetPasswordResponse,
  IAuthenticatedRequest,

} from "../interfaces";





export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const registerData: IRegisterRequest = req.body;
    logger.info(`Registration attempt for email:${registerData.email} `)

    const result: IAuthServiceResponse<IRegisterResponseData> =
      await authService.register(registerData);

    if (result.success) {
      logAuthEvent("REGISTER", undefined, registerData.email, true);
    } else {
      logAuthEvent("REGISTER_FAILED", undefined, registerData.email, false)
    }

    return res
      .status(result.success ? HttpStatusCode.CREATED : HttpStatusCode.BAD_REQUEST)
      .json(result);
  } catch (error) {
    logError(error as Error, {
      endpoint: "api/auth/register",
      method: "POST",
      body: req.body,
    });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.AUTH.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
};

export const verifyOTP = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const verifyData: IVerifyOTPRequest = req.body;
    logger.info(`OTP verification attempt for email: ${verifyData.email}`)

    const result: IAuthServiceResponse<IVerifyOTPResponseData> =
      await authService.verifyEmail(verifyData);

    if (result.success) {
      logAuthEvent("VERIFY_OTP", undefined, verifyData.email, true)
    } else {
      logAuthEvent("VERIFY_OTP", undefined, verifyData.email, false)
    }

    return res
      .status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST)
      .json(result);
  } catch (error) {
    logError(error as Error, {
      endpoint: "api/auth/verify-otp",
      method: "POST",
      body: req.body,
    });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.AUTH.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
};


export const resendOTP = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const resendData: IResendOTPRequest = req.body;
    logger.info(`Resend OTP request  for email${resendData.email}`)
    const result: IAuthServiceResponse =
      await authService.resendOTP(resendData.email);
    if (result.success) {
      logAuthEvent("RESEND_OTP", undefined, resendData.email, true);
    } else {
      logAuthEvent("RESEND_OTP", undefined, resendData.email, false)
    }
    return res
      .status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST)
      .json(result);
  } catch (error) {
    logError(error as Error, {
      endpoint: "/api/auth/resend-otp",
      method: "POST",
      body: req.body,
    });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.AUTH.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
};
export const login = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const loginData: ILoginRequest = req.body;


    const result: IAuthServiceResponse<ILoginResponseData> =
      await authService.login(loginData);

    let status = HttpStatusCode.OK;
    if (!result.success) {
      status = result.message === MESSAGES.AUTH.ACCOUNT_NOT_ACTIVATED
        ? HttpStatusCode.FORBIDDEN
        : HttpStatusCode.UNAUTHORIZED;
    }

    return res.status(status).json(result);
  } catch (error) {
    logError(error as Error, {
      endpoint: "api/auth/login",
      method: "POST",
      body: req.body,
    });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.AUTH.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
};
export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data: IForgotPasswordRequest = req.body;
    logger.info(`Forgot passeword request for email: ${data.email}`);
    const result: IAuthServiceResponse<IForgotPasswordResponse> = await authService.forgotPassword(data);
    return res.status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST).json(result);

  } catch (error) {
    logError(error as Error, {
      endpoint: "api/auth/forgot-password",
      method: "POST",
      body: req.body,
    });
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
      timestamp: new Date().toISOString(),
    });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data: IResetPasswordRequest = req.body;
    logger.info(`Password reset attempt for email: ${data.email}`);
    const result: IAuthServiceResponse<IResetPasswordResponse> = await authService.resetPassword(data);
    return res.status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST).json(result);

  } catch (error) {
    logError(error as Error, {
      endpoint: "api/auth/reset-password",
      method: "POST",
      body: req.body,
    })
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.AUTH.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
};

export const changePassword = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.userId;
    const data: IChangePasswordRequest = req.body;

    logger.info(`Change password request for user ID: ${userId}`);

    if (!userId) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "User not authenticated",
        timestamp: new Date().toISOString(),
      });
    }

    const result = await authService.changePassword(userId, data);

    return res
      .status(
        result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST
      )
      .json(result);
  } catch (error) {
    logError(error as Error, {
      endpoint: "/api/auth/change-password",
      method: "POST",
      body: req.body,
    });

    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.AUTH.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
};


export const logout = async (req: IAuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;
    logger.info(`Logout attempt for user ID: ${userId}`);

    if (!userId) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: " User is not authenticated",
        timestamp: new Date().toISOString(),
      });
    }

    const result = await authService.logout(userId);
    return res.status(HttpStatusCode.OK).json(result);
  } catch (error) {
    logError(error as Error, {
      endpoint: "api/auth/logout",
      method: "POST",
    });

    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.AUTH.INTERNAL_ERROR,
      timestamp: new Date().toISOString
    })
  }
}