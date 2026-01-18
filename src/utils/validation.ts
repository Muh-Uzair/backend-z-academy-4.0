import { Request, Response, NextFunction } from "express";
import * as z from "zod";

export const validation = <TSchema extends z.ZodTypeAny>(schema: TSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid data provided",
        errors: parsed.error.issues,
      });
      return;
    }

    req.body = parsed.data;
    next();
  };
};
