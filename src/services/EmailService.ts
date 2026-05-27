import nodemailer from "nodemailer";
import dotenv from "dotenv";
import logger from "../config/logger"
import { logError } from "../middlewares/logger";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error, _success) => {
  if(error) {
    logger.error("SMTP Connection Error:", error);
  }else {
    logger.info("SMTP Server is ready to take your messages");
  }
})

const getOTPEmailTemplate = (otp: string , expiryMinutes : string) : string  => {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Email Verification</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <p style="color: #333;">Hello,</p>
        <p style="color: #666;">Your OTP verification code is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="color: #667eea; letter-spacing: 5px; font-family: monospace; background: white; padding: 20px; border-radius: 5px; font-size: 32px; font-weight: bold; border: 2px solid #667eea;">
            ${otp}
          </div>
        </div>
        <p style="color: #999; font-size: 14px;">This code will expire in ${expiryMinutes} minutes.</p>
        <p style="color: #999; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      </div>
      <div style="padding: 20px; background: #f0f0f0; border-radius: 0 0 10px 10px; text-align: center; border-top: 1px solid #ddd;">
        <p style="color: #999; font-size: 12px; margin: 0;">This is an automated email. Please do not reply.</p>
      </div>
    </div>
  `;
}

const getForgotPasswordEmailTemplate = (
  otp: string,
  expiryMinutes: string
): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Password Reset Request</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <p style="color: #333;">Hello,</p>
        <p style="color: #666;">We received a request to reset your password. Use the OTP code below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="color: #667eea; letter-spacing: 5px; font-family: monospace; background: white; padding: 20px; border-radius: 5px; font-size: 32px; font-weight: bold; border: 2px solid #667eea;">
            ${otp}
          </div>
        </div>
        <p style="color: #999; font-size: 14px;"><strong>Important:</strong> This code will expire in ${expiryMinutes} minutes.</p>
        <p style="color: #999; font-size: 14px;">If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
      </div>
      <div style="padding: 20px; background: #f0f0f0; border-radius: 0 0 10px 10px; text-align: center; border-top: 1px solid #ddd;">
        <p style="color: #999; font-size: 12px; margin: 0;">This is an automated email. Please do not reply.</p>
      </div>
    </div>
  `;
};
const getPasswordResetSuccessTemplate = (userName: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Password Changed Successfully</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <p style="color: #333;">Hello ${userName},</p>
        <p style="color: #666;">Your password has been successfully changed.</p>
        <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; border-left: 4px solid #4caf50; margin: 20px 0;">
          <p style="color: #2e7d32; margin: 0;">
            <strong>✓</strong> Your account is now secure with the new password.
          </p>
        </div>
        <p style="color: #999; font-size: 14px;">If you didn't make this change, please contact our support team immediately.</p>
      </div>
      <div style="padding: 20px; background: #f0f0f0; border-radius: 0 0 10px 10px; text-align: center; border-top: 1px solid #ddd;">
        <p style="color: #999; font-size: 12px; margin: 0;">This is an automated email. Please do not reply.</p>
      </div>
    </div>
  `;
};

export const sendOTPEmail = async (
  email: string,
  otp: string
): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: "Your OTP Verification Code",
      html: getOTPEmailTemplate(otp, process.env.OTP_EXPIRY_MINUTES || "10"),
    });

    logger.info(`OTP email sent successfully to: ${email}`);
    return true;
  } catch (error) {
    logError(error as Error, {
      endpoint: "EmailService.sendOTPEmail",
      body: { email },
    });
    return false;
  }
};

// Send forgot password OTP email
export const sendForgotPasswordEmail = async (
  email: string,
  otp: string
): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: "Password Reset OTP",
      html: getForgotPasswordEmailTemplate(
        otp,
        process.env.OTP_EXPIRY_MINUTES || "10"
      ),
    });

    logger.info(`Forgot password email sent successfully to: ${email}`);
    return true;
  } catch (error) {
    logError(error as Error, {
      endpoint: "EmailService.sendForgotPasswordEmail",
      body: { email },
    });
    return false;
  }
};

// Send password reset success email
export const sendPasswordResetSuccessEmail = async (
  email: string,
  userName: string
): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: "Your Password Has Been Changed",
      html: getPasswordResetSuccessTemplate(userName),
    });

    logger.info(
      `Password reset success email sent successfully to: ${email}`
    );
    return true;
  } catch (error) {
    logError(error as Error, {
      endpoint: "EmailService.sendPasswordResetSuccessEmail",
      body: { email },
    });
    return false;
  }
};
