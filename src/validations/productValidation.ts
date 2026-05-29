import Joi from "joi";

export const createProductSchema = Joi.object({
  store_id: Joi.number().required(),
  name: Joi.string()
  .min(2)
  .max(100)
  .required(),
  price: Joi.number()
  .positive()
  .required(),
  categories_id: Joi.number()
  .required(),
  stock: Joi.number()
  .min(0)
  .default(0),
  sku: Joi.string()
  .max(50)
  .optional()
  .allow(null, ""),
  is_active: Joi.boolean()
  .default(true),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  price: Joi.number().positive().optional(),
  categories_id: Joi.number().optional(),
  stock: Joi.number().min(0).optional(),
  sku: Joi.string().max(50).optional().allow(null, ""),
  is_active: Joi.boolean().optional(),
}).min(1);