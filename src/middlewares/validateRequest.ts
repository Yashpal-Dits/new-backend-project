import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validateRequest = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));
      
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }

    // Attach validated data to request
    req.body = value;
    next();
  };
};