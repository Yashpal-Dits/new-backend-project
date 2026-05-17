import { Request, Response } from "express";
import * as authService from "../services/AuthService";

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await authService.register(req.body);
        res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {

    try {
        const result = await authService.verifyEmail(req.body);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error("Verify OTP service:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const resendOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await authService.resendOTP(req.body.email);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error("Resend OTP error:", error);
        res.status(500).json({
            success: false,
            message: " Internal server error",
        });
    }
};
