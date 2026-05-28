import Joi from "joi";
import { CATEGORY_MESSAGES } from "../constants/categoryMessages";

export const createCategorySchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": CATEGORY_MESSAGES.VALIDATION.CATEGORY_NAME_REQUIRED,
      "string.min": CATEGORY_MESSAGES.VALIDATION.CATEGORY_NAME_MIN_LENGTH,
      "string.max": CATEGORY_MESSAGES.VALIDATION.CATEGORY_NAME_MAX_LENGTH,
      "any.required": CATEGORY_MESSAGES.VALIDATION.CATEGORY_NAME_REQUIRED,
    }),
  description: Joi.string().max(500).optional().allow("").messages({
    "string.max":
      CATEGORY_MESSAGES.VALIDATION.CATEGORY_DESCRIPTION_MAX_LENGTH,
  }),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .optional()
    .messages({
      "string.min": CATEGORY_MESSAGES.VALIDATION.CATEGORY_NAME_MIN_LENGTH,
      "string.max": CATEGORY_MESSAGES.VALIDATION.CATEGORY_NAME_MAX_LENGTH,
    }),
  description: Joi.string().max(500).optional().allow("").messages({
    "string.max":
      CATEGORY_MESSAGES.VALIDATION.CATEGORY_DESCRIPTION_MAX_LENGTH,
  }),
}).min(1);

export const categoryIdSchema = Joi.object({
  id: Joi.number()
    .required()
    .messages({
      "number.base": CATEGORY_MESSAGES.VALIDATION.CATEGORY_ID_INVALID,
      "any.required": CATEGORY_MESSAGES.VALIDATION.CATEGORY_ID_REQUIRED,
    }),
});

export const categoryNameSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": CATEGORY_MESSAGES.VALIDATION.CATEGORY_NAME_REQUIRED,
      "string.min": CATEGORY_MESSAGES.VALIDATION.CATEGORY_NAME_MIN_LENGTH,
      "string.max": CATEGORY_MESSAGES.VALIDATION.CATEGORY_NAME_MAX_LENGTH,
      "any.required": CATEGORY_MESSAGES.VALIDATION.CATEGORY_NAME_REQUIRED,
    }),
});