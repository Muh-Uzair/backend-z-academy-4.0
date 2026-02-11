import { Request, Response, NextFunction } from "express";
import {
  rotateService,
  signinService,
  signupService,
  verifyOTPService,
  signoutService,
} from "./auth.service";
import { env } from "@/config/env";
import { sendResponse } from "@/utils/sendResponse";

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
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
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
  const { accessToken, refreshToken, user } = await signinService(req.body);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 60 * 60 * 1000, // 15 mins
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  sendResponse(res, 200, {
    status: "success",
    message: "Signin successful",
    data: { user },
  });
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
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 15 mins
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
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
