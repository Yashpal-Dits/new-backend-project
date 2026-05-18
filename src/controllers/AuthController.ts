import { Request, Response } from "express";
import * as authService from "../services/AuthService";
import { MESSAGES } from "../constants/messages";
import { HttpStatusCode } from "../enums";
import type {
  IRegisterRequest,
  IVerifyOTPRequest,
  IResendOTPRequest,
  IAuthServiceResponse,
  IRegisterResponseData,
  IVerifyOTPResponseData,
} from "../interfaces";

export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const registerData: IRegisterRequest = req.body;
    const result: IAuthServiceResponse<IRegisterResponseData> =
      await authService.register(registerData);

    return res
      .status(result.success ? HttpStatusCode.CREATED : HttpStatusCode.BAD_REQUEST)
      .json(result);
  } catch (error) {
    console.error("Register error:", error);
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
    const result: IAuthServiceResponse<IVerifyOTPResponseData> =
      await authService.verifyEmail(verifyData);

    return res
      .status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST)
      .json(result);
  } catch (error) {
    console.error("Verify OTP error:", error);
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
    const result: IAuthServiceResponse =
      await authService.resendOTP(resendData.email);

    return res
      .status(result.success ? HttpStatusCode.OK : HttpStatusCode.BAD_REQUEST)
      .json(result);
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.AUTH.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
};
