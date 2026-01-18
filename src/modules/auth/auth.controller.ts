import { Request, Response, NextFunction } from "express";
import {
  rotateService,
  signinService,
  signupService,
  verifyOTPService,
  signoutService,
} from "./auth.service";

// FUNCTION
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

// FUNCTION
export const verifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // pass control to service
  const result = await verifyOTPService(req.body);

  // send response
  res.status(200).json({
    status: "success",
    message: "Email verified",
    data: result,
  });

  return;
};

// FUNCTION
export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // pass control to service
  const { accessToken, refreshToken } = await signinService(req.body);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // send response
  res.status(200).json({
    status: "success",
    message: "Signin successful",
  });

  return;
};

// FUNCTION
export const rotate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // pass control to service
  const { newAccessToken, newRefreshToken } = await rotateService(req);

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // send response
  res.status(200).json({
    status: "success",
    message: "Rotate successful",
  });

  return;
};

// FUNCTION
export const signout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // pass control to service
  await signoutService(req);

  // Clear cookies
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  // send response
  res.status(200).json({
    status: "success",
    message: "Signout successful",
  });

  return;
};
