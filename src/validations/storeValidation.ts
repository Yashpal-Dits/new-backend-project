import Joi from "joi";
import { STORE_MESSAGES } from "../constants/storeMessages";

export const createStoreSchema = Joi.object({
  user_id: Joi.number().required().messages({
    "number.base": STORE_MESSAGES.STORE.VALIDATION.USER_ID_INVALID,
    "any.required": STORE_MESSAGES.STORE.VALIDATION.USER_ID_REQUIRED,
  }),
  store_name: Joi.string().min(3).max(100).required().messages({
    "string.empty": STORE_MESSAGES.STORE.VALIDATION.STORE_NAME_REQUIRED,
    "string.min": STORE_MESSAGES.STORE.VALIDATION.STORE_NAME_MIN_LENGTH,
    "string.max": STORE_MESSAGES.STORE.VALIDATION.STORE_NAME_MAX_LENGTH,
    "any.required": STORE_MESSAGES.STORE.VALIDATION.STORE_NAME_REQUIRED,
  }),
  description: Joi.string().max(500).optional().allow(""),
  business_email: Joi.string().email().optional().allow(""),
  is_active: Joi.boolean().optional(),
});

export const updateStoreSchema = Joi.object({
  user_id: Joi.number().optional().messages({
    "number.base": STORE_MESSAGES.STORE.VALIDATION.USER_ID_INVALID,
  }),
  store_name: Joi.string().min(3).max(100).optional().messages({
    "string.min": STORE_MESSAGES.STORE.VALIDATION.STORE_NAME_MIN_LENGTH,
    "string.max": STORE_MESSAGES.STORE.VALIDATION.STORE_NAME_MAX_LENGTH,
  }),
  description: Joi.string().max(500).optional().allow(""),
  business_email: Joi.string().email().optional().allow(""),
  is_active: Joi.boolean().optional(),
}).min(1);
