import {Router} from "express";
import * as authController from "../controllers/AuthController";
import { validateRequest } from "../middlewares/validateRequest";
import{
    registerSchema,
    verifyOTPSchema,
    resendOTPSchema,
} from "../validations/authValidation";


const router = Router();

router.post(
    "/register", 
    validateRequest(registerSchema),
     authController.register
);

router.post(
    "/verify-otp",
    validateRequest(verifyOTPSchema),
    authController.verifyOTP
);

router.post(
    "/resend-otp",
    validateRequest(resendOTPSchema),
    authController.resendOTP
)

export default router;