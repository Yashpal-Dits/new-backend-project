import Joi from "joi";

export const addToCartSchema = Joi.object({
  product_id: Joi.number().integer().positive().required().messages({
    "number.base": "Product ID must be a number",
    "any.required": "Product ID is required",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),
});

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required().messages({
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),
});

export const checkoutSchema = Joi.object({
  address_id: Joi.number().integer().positive().required().messages({
    "number.base": "Address ID must be a number",
    "any.required": "Address ID is required",
  }),
  payment_method: Joi.string()
    .valid("card", "upi", "cod", "paypal")
    .required()
    .messages({
      "any.only": "Payment method must be one of: card, upi, cod, paypal",
      "any.required": "Payment method is required",
    }),
});