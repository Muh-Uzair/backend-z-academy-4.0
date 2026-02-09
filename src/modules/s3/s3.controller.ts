import { Request, Response, NextFunction } from "express";
import { putObjectCommandService } from "./s3.service";

// FUNCTION
export const putObjectCommand = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // pass control to service
  const result = await putObjectCommandService(req.body);

  // send response
  res.status(201).json({
    status: "success",
    message: "Get preSignURL successful",
    data: result,
  });

  return;
};
