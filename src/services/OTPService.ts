import { sendOTPEmail } from "./EmailService";
import{
    saveOTP,
    findByEmailAndOTP,
    markAsUsed,
    deleteOldOTPs
} from "../repositories/OTPRepositry";

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || "10");
const OTP_LENGTH = parseInt(process.env.OPT_LENGTH || "6");

const generateOTP = () : string => {
    const min = Math.pow(10, OTP_LENGTH -1);
    const max = Math.pow(10, OTP_LENGTH -1);
    return Math.floor(min+ Math.random() * (max -min + 1)).toString();
};

export  const sendOTP = async (
    email : string
): Promise<{ success : boolean; message: string}> => {
    try {
        await deleteOldOTPs(email);

        const otp = generateOTP();
        const expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        await saveOTP(email, otp, expires_at);

    const emailSent = await sendOTPEmail(email, otp);

    if(!emailSent) {
        return {
            success: false,
            message:"Failed to send OTP email",
        };
    }

    return {
        success: true,
        message:   `OTP sent to ${email}. Valid for ${OTP_EXPIRY_MINUTES}.`,
    };
    } catch (error) {
      console.error("Error in send OTP:", error);
      
      return {
        success: false,
        message: "Error sending OTP",
      };
    }
};

export const verifyOTP = async (
    email: string,
    otp: string
): Promise<{success: boolean; message : string} >  => {
    try {
        const otpRecord = await findByEmailAndOTP(email, otp);

        if(!otpRecord) {
            return {
                success: false,
                message: "Invalid OTP code",
            };
        }
        if(new Date() > otpRecord.expires_at)  {
            return {
                success: false,
                message: "OTP has expired",
            };
        }

        await markAsUsed(otpRecord.id)
            return {
                success: true,
                message : "OTP verified successfully",
            };
    } catch (error) {
        console.error("Error in verify OTP;", error);

        return {
            success: false,
            message: "Error verifying OTP"
        }
    }
};

export const resendOTP = async (
    email: string
): Promise<{success: boolean; message: string}> => {
    try {
        await deleteOldOTPs(email);

        const otp = generateOTP();
        const expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

        await saveOTP(email, otp, expires_at);

        const emailSent = await sendOTPEmail(email, otp);

        if(!emailSent) {
            return {
                success: false,
                message : "Failed to send OTP email",
            };
        }

        return {
            success: true,
            message: `OTP resent to ${email}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
        };
    } catch (error) {
        console.error("Error in resend OTP:", error);
        return {
            success: false,
            message : "Error  resending OTP",
        };
    }
};

