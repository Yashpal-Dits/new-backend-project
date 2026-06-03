import Joi  from "joi";

export const createAddressSchema = Joi.object({
    address_line: Joi.string().required(),
    city: Joi.string().required(),
  state: Joi.string().required(),
  zip_code: Joi.string().required(),
  country: Joi.string().required(),
});

export const updateAddressSchema = Joi.object({
    address_line: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  zip_code: Joi.string().optional(),
  country: Joi.string().optional(),
}).min(1);