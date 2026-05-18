import { sendOTPEmail } from "./EmailService";
import {
  saveOTP,
  findByEmailAndOTP,
  markAsUsed,
  deleteOldOTPs,
} from "../repositories/OTPRepository";
import { MESSAGES } from "../constants/messages";
import { OTPPurpose } from "../enums";
import type { IOTPServiceResponse } from "../interfaces";

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
    await deleteOldOTPs(email, purpose);

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await saveOTP(email, otp, expiresAt, purpose);

    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return {
        success: false,
        message: MESSAGES.AUTH.OTP_SEND_FAILED,
        timestamp: new Date().toISOString(),
      };
    }

    console.log(`\n🔐 OTP for ${email}: ${otp}`);
    console.log(`⏰ Expires at: ${expiresAt.toLocaleTimeString()}\n`);

    return {
      success: true,
      message: MESSAGES.AUTH.OTP_SENT(email),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error in sendOTP:", error);
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
    const otpRecord = await findByEmailAndOTP(email, otp, purpose);

    if (!otpRecord) {
      return {
        success: false,
        message: MESSAGES.AUTH.OTP_INVALID,
        timestamp: new Date().toISOString(),
      };
    }

    if (new Date() > otpRecord.expires_at) {
      return {
        success: false,
        message: MESSAGES.AUTH.OTP_EXPIRED,
        timestamp: new Date().toISOString(),
      };
    }

    await markAsUsed(otpRecord.id);

    return {
      success: true,
      message: MESSAGES.AUTH.OTP_VERIFIED,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    return {
      success: false,
      message: MESSAGES.AUTH.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    };
  }
};

export const resendOTP = async (
  email: string,
  purpose: OTPPurpose = OTPPurpose.REGISTRATION
): Promise<IOTPServiceResponse> => {
  try {
    await deleteOldOTPs(email, purpose);

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await saveOTP(email, otp, expiresAt, purpose);

    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return {
        success: false,
        message: MESSAGES.AUTH.OTP_SEND_FAILED,
        timestamp: new Date().toISOString(),
      };
    }

    console.log(`\n🔐 Resent OTP for ${email}: ${otp}`);
    console.log(`⏰ Expires at: ${expiresAt.toLocaleTimeString()}\n`);

    return {
      success: true,
      message: MESSAGES.AUTH.OTP_RESENT(email),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error in resendOTP:", error);
    return {
      success: false,
      message: MESSAGES.AUTH.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    };
  }
};