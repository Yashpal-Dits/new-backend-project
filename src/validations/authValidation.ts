import Joi from "joi";
import { MESSAGES } from "../constants/messages";

export const registerSchema = Joi.object({
  first_name: Joi.string().required().messages({
    "string.empty": MESSAGES.VALIDATION.FIRST_NAME_REQUIRED,
    "any.required": MESSAGES.VALIDATION.FIRST_NAME_REQUIRED,
  }),
  last_name: Joi.string().required().messages({
    "string.empty": MESSAGES.VALIDATION.LAST_NAME_REQUIRED,
    "any.required": MESSAGES.VALIDATION.LAST_NAME_REQUIRED,
  }),
  email: Joi.string().email().required().messages({
    "string.email": MESSAGES.VALIDATION.EMAIL_INVALID,
    "string.empty": MESSAGES.VALIDATION.EMAIL_REQUIRED,
    "any.required": MESSAGES.VALIDATION.EMAIL_REQUIRED,
  }),
  password: Joi.string()
    .min(8)
    .pattern(/[A-Z]/)
    .pattern(/[0-9]/)
    .required()
    .messages({
      "string.min": MESSAGES.VALIDATION.PASSWORD_MIN_LENGTH,
      "string.pattern.base": MESSAGES.VALIDATION.PASSWORD_UPPERCASE,
      "any.required": MESSAGES.VALIDATION.PASSWORD_REQUIRED,
    }),
});

export const verifyOTPSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": MESSAGES.VALIDATION.EMAIL_INVALID,
    "any.required": MESSAGES.VALIDATION.EMAIL_REQUIRED,
  }),
  otp: Joi.string().length(6).required().messages({
    "string.length": MESSAGES.VALIDATION.OTP_LENGTH,
    "any.required": MESSAGES.VALIDATION.OTP_REQUIRED,
  }),
});

export const resendOTPSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": MESSAGES.VALIDATION.EMAIL_INVALID,
    "any.required": MESSAGES.VALIDATION.EMAIL_REQUIRED,
  }),
});

export const loginSchema = Joi.object({
   email: Joi.string().email().required().messages({
    "string.email": MESSAGES.VALIDATION.EMAIL_INVALID,
    "string.empty": MESSAGES.VALIDATION.EMAIL_REQUIRED,
    "any.required": MESSAGES.VALIDATION.EMAIL_REQUIRED,
  }),
  password: Joi.string()
    .required()
    .messages({
      "string.min": MESSAGES.VALIDATION.PASSWORD_MIN_LENGTH,
      "string.pattern.base": MESSAGES.VALIDATION.PASSWORD_UPPERCASE,
      "any.required": MESSAGES.VALIDATION.PASSWORD_REQUIRED,
})
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": MESSAGES.VALIDATION.EMAIL_INVALID,
    "string.empty": MESSAGES.VALIDATION.EMAIL_REQUIRED,
    "any.required": MESSAGES.VALIDATION.EMAIL_REQUIRED,
  }),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": MESSAGES.VALIDATION.EMAIL_INVALID,
    "any.required": MESSAGES.VALIDATION.EMAIL_REQUIRED,
  }),
  otp: Joi.string().length(6).required().messages({
    "string.length": MESSAGES.VALIDATION.OTP_LENGTH,
    "any.required": MESSAGES.VALIDATION.OTP_REQUIRED,
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/[A-Z]/, "uppercase")
    .pattern(/[0-9]/, "number")
    .required()
    .messages({
      "string.min": MESSAGES.VALIDATION.PASSWORD_MIN_LENGTH,
      "string.pattern.uppercase":
        MESSAGES.VALIDATION.PASSWORD_UPPERCASE,
      "string.pattern.number": MESSAGES.VALIDATION.PASSWORD_NUMBER,
      "any.required": MESSAGES.VALIDATION.NEW_PASSWORD_REQUIRED,
    }),
});
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": MESSAGES.VALIDATION.CURRENT_PASSWORD_REQUIRED,
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/[A-Z]/, "uppercase")
    .pattern(/[0-9]/, "number")
    .required()
    .messages({
      "string.min": MESSAGES.VALIDATION.PASSWORD_MIN_LENGTH,
      "string.pattern.uppercase":
        MESSAGES.VALIDATION.PASSWORD_UPPERCASE,
      "string.pattern.number": MESSAGES.VALIDATION.PASSWORD_NUMBER,
      "any.required": MESSAGES.VALIDATION.NEW_PASSWORD_REQUIRED,
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": MESSAGES.VALIDATION.PASSWORDS_NOT_MATCH,
      "any.required": MESSAGES.VALIDATION.CONFIRM_PASSWORD_REQUIRED,
    }),
});