import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { ValidationError } from "@/types/responses";

/**
 * Middleware to validate request using express-validator
 */
export const validate = (validations: ValidationChain[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors
        .array()
        .map((err: any) => `${err.path}: ${err.msg}`)
        .join(", ");

      return next(new ValidationError(errorMessages));
    }

    next();
  };
};

