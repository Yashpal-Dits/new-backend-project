import Joi from "joi";

export const registerSchema = Joi.object({
  first_name: Joi.string().required().messages({
    "string.empty": "First name is required",
    "any.required": "First name is required",
  }),
  last_name: Joi.string().required().messages({
    "string.empty": "Last name is required",
    "any.required": "Last name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(8)
    .pattern(/[A-Z]/) // At least one uppercase
    .pattern(/[0-9]/) // At least one number
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base": "Password must contain uppercase letters and numbers",
      "any.required": "Password is required",
    }),
});

export const verifyOTPSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  otp: Joi.string().length(6).required().messages({
    "string.length": "OTP must be 6 digits",
    "any.required": "OTP is required",
  }),
});

export const resendOTPSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
});