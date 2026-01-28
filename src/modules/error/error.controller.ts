import AppError from "@/utils/appError";
import { NextFunction, Response, Request } from "express";
import {
  handleCastErrorDB,
  handleDuplicateFieldsDB,
  handleJWTError,
  handleJWTExpiredError,
  handleValidationErrorDB,
  handleZodError,
} from "./error.utils";

const sendErrorDev = (err: AppError, res: Response) => {
  //   res.status(err.statusCode).json({
  //     status: err.status,
  //     error: err,
  //     message: err.message,
  //     stack: err.stack,
  //   });
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming or other unknown error: don't leak error details
  else {
    // 1) Log error for debugging
    console.error("ERROR 💥", err);

    // 2) Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    // MongoDB CastError (Invalid ObjectId)
    if (err.name === "CastError") {
      error = handleCastErrorDB(err);
    }

    // MongoDB Duplicate Key Error (E11000)
    if (err.code === 11000) {
      error = handleDuplicateFieldsDB(err);
    }

    // MongoDB Validation Error
    if (err.name === "ValidationError") {
      error = handleValidationErrorDB(err);
    }

    // JWT Error
    if (err.name === "JsonWebTokenError") {
      error = handleJWTError();
    }

    // JWT Expired Error
    if (err.name === "TokenExpiredError") {
      error = handleJWTExpiredError();
    }

    // Zod Validation Error
    if (err.name === "ZodError") {
      error = handleZodError(err);
    }

    sendErrorProd(error, res);
  }
};
