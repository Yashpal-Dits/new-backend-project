import { sendOTPEmail, sendForgotPasswordEmail} from "./EmailService";
import {
  saveOTP,
  findByEmailAndOTP,
  markAsUsed,
  deleteOldOTPs,
} from "../repositories/OTPRepository";
import { MESSAGES } from "../constants/messages";
import { OTPPurpose } from "../enums";
import type { IOTPServiceResponse } from "../interfaces/authInterfaces";
import logger from "../config/logger";
import { logError } from "../middlewares/logger";






const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || "10");
const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || "6");

const generateOTP = (): string => {
  const digits = "0123456789";
  let otp = "";

  for (let i = 0; i < OTP_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    otp += digits[randomIndex];
  }

  return otp;
};

export const sendOTP = async (
  email: string,
  purpose: OTPPurpose = OTPPurpose.REGISTRATION
): Promise<IOTPServiceResponse> => {
  try {

    logger.info(`Initiating OTP generation for: ${email} (Purpose: ${purpose})`);
    await deleteOldOTPs(email, purpose);

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await saveOTP(email, otp, expiresAt, purpose);

    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      logger.error(`Failed to send the OTP email to :${email}`)
      return {
        success: false,
        message: MESSAGES.AUTH.OTP_SEND_FAILED,
        timestamp: new Date().toISOString(),
      };
    }

    logger.debug(`OTP for ${email}: ${otp} (Expires: ${expiresAt.toLocaleDateString()})`);

    console.log(`OTP for ${email}: ${otp}`);
    console.log(`Expires at: ${expiresAt.toLocaleTimeString()}`);

    return {
      success: true,
      message: MESSAGES.AUTH.OTP_SENT(email),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "OTPService.sendOTP",
      body: { email, purpose },
    });
    return {
      success: false,
      message: MESSAGES.AUTH.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    };
  }
};

export const sendForgotPasswordOTP = async (
  email: string
): Promise<IOTPServiceResponse> => {
  try {
    logger.info(`Initiating forgot password OTP for: ${email}`);

    await deleteOldOTPs(email, OTPPurpose.PASSWORD_RESET);

    const otp = generateOTP();
    const expiresAt = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );

    await saveOTP(email, otp, expiresAt, OTPPurpose.PASSWORD_RESET);

    const emailSent = await sendForgotPasswordEmail(email, otp);
    if (!emailSent) {
      logger.error(
        `Failed to send forgot password email to: ${email}`
      );
      return {
        success: false,
        message: MESSAGES.AUTH.OTP_SEND_FAILED,
        timestamp: new Date().toISOString(),
      };
    }

    if (process.env.NODE_ENV === "development") {
      logger.debug(`Forgot password OTP for ${email}: ${otp}`);
      logger.debug(`Expires at: ${expiresAt.toLocaleTimeString()}`);
    }

    return {
      success: true,
      message: MESSAGES.AUTH.FORGOT_PASSWORD_OTP_SENT,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "OTPService.sendForgotPasswordOTP",
      body: { email },
    });
    return {
      success: false,
      message: MESSAGES.AUTH.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    };
  }
};

export const verifyOTP = async (
  email: string,
  otp: string,
  purpose: OTPPurpose = OTPPurpose.REGISTRATION
): Promise<IOTPServiceResponse> => {
  try {
    logger.info(`Verifying OTP for: ${email}`);
    const otpRecord = await findByEmailAndOTP(email, otp, purpose);

    if (!otpRecord) {
      logger.warn(`Invalid OTP attempt for: ${email}`);
      return {
        success: false,
        message: MESSAGES.AUTH.OTP_INVALID,
        timestamp: new Date().toISOString(),
      };
    }

    if (new Date() > otpRecord.expires_at) {
      logger.warn(`Expired OTP attempt for: ${email}`);
      return {
        success: false,
        message: MESSAGES.AUTH.OTP_EXPIRED,
        timestamp: new Date().toISOString(),
      };
    }

    await markAsUsed(otpRecord.id);
    logger.info(`OTP successfully verified for: ${email}`);

    return {
      success: true,
      message: MESSAGES.AUTH.OTP_VERIFIED,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error as Error, {
      endpoint: "OTPService.verifyOTP",
      body: { email, purpose },
    });
    return {
      success: false,
      message: MESSAGES.AUTH.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    };
  }
};