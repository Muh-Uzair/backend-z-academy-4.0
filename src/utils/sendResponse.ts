import { Response } from "express";

interface ISendResponse {
  status: "success" | "error";
  message?: string;
  data?: any;
}

export const sendResponse = (
  res: Response,
  statusCode: number,
  { status, message, data = {} }: ISendResponse,
) => {
  res.status(statusCode).json({
    status,
    message,
    data,
  });

  return;
};
