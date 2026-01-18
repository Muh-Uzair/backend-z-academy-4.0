import { Request, Response, NextFunction } from "express";
import { signupService } from "./auth.service";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // pass control to service
  const result = await signupService(req.body);

  // send response
  res.status(201).json({
    status: "success",
    message: "signup successful",
    data: result,
  });

  return;
};
