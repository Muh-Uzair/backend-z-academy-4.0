import AppError from "@/utils/appError";
import mongoose from "mongoose";

/**
 * Handle MongoDB CastError (Invalid ObjectId)
 * Example: User.findById("invalid-id")
 */
export const handleCastErrorDB = (err: mongoose.Error.CastError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB Duplicate Key Error (E11000)
 * Example: Duplicate email registration
 */
export const handleDuplicateFieldsDB = (err: any): AppError => {
  // Extract field name and value from error
  const field = Object.keys(err.keyValue)?.[0];
  const value = field ? err.keyValue[field] : "unknown";

  const message = `Duplicate field value: ${field || "unknown"} = '${value}'. Please use another value!`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose Validation Error
 * Example: Required fields missing, min/max length violations
 */
export const handleValidationErrorDB = (
  err: mongoose.Error.ValidationError,
): AppError => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT Errors
 */
export const handleJWTError = (): AppError => {
  return new AppError("Invalid token. Please log in again!", 401);
};

export const handleJWTExpiredError = (): AppError => {
  return new AppError("Your token has expired! Please log in again.", 401);
};

/**
 * Handle Zod Validation Errors
 */
export const handleZodError = (err: any): AppError => {
  const errors = err.errors.map((e: any) => {
    const path = e.path.join(".");
    return `${path}: ${e.message}`;
  });

  const message = `Validation failed. ${errors.join(". ")}`;
  return new AppError(message, 400);
};
