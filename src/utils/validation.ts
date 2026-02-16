import { Request, Response, NextFunction } from "express";
import * as z from "zod";
import { sendResponse } from "./sendResponse";

export const validation = <TSchema extends z.ZodTypeAny>(schema: TSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      sendResponse(res, 400, {
        status: "fail",
        message: "Invalid data provided",
        data: { errors: parsed.error.issues },
      });

      return;
    }

    req.body = parsed.data;
    next();
  };
};

export const validationParams = <TSchema extends z.ZodTypeAny>(
  schema: TSchema,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.params);

    if (!parsed.success) {
      sendResponse(res, 400, {
        status: "fail",
        message: "Invalid data provided",
        data: { errors: parsed.error.issues },
      });

      return;
    }

    req.body = parsed.data;
    next();
  };
};
