import Joi from "joi";

export const checkoutSchema = Joi.object({
  address_id: Joi.number().required(),
});
