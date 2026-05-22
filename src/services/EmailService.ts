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

export const sendOTPEmail = async (
  email: string,
  otp: string
): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: "Your OTP Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Hello,</p>
          <p>Your OTP verification code is:</p>
          <div style="text-align: center; margin: 20px 0;">
            <h1 style="color: #667eea; letter-spacing: 5px; font-family: monospace; background: #f5f5f5; padding: 20px; border-radius: 5px;">
              ${otp}
            </h1>
          </div>
          <p>This code will expire in ${process.env.OTP_EXPIRY_MINUTES} minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      `,
    });
    logger.info(` OTP email sent successfully  to: ${email}`);
    return true;
  } catch (error) {
    logError(error as Error, {
      endpoint:"EmailService.sendOTPEmail",
      body:{email},
    });
    return false;
  }
};