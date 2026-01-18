import UserModel from "../users/users.model";
import {
  validationSignInType,
  validationSignUpType,
  validationVerifyOTPType,
} from "./auth.types";
import bcrypt from "bcrypt";
import { generateOtp } from "./auth.utils";
import { sendOTPEmail } from "@/lib/email.lib";
import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
} from "./auth.lib";
import { Request } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";

// FUNCTION
export const signupService = async (reqBody: validationSignUpType) => {
  // 1: Check if user already exists
  const existingUser = await UserModel.findOne({ email: reqBody.email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // 2: Hash password
  const hashedPassword = await bcrypt.hash(reqBody.password, 12);

  // 3: Generate OTP
  const otp = generateOtp();

  // 4: Create user and profile (you can wrap it in a transaction)
  await UserModel.create({
    ...reqBody,
    password: hashedPassword,
    otp,
    otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
  });

  // 5: Send OTP email
  await sendOTPEmail({ to: reqBody.email, otp });

  // 6: Return only what controller needs
  return new Promise((resolve) => {
    resolve({});
  });
};

// FUNCTION
export const verifyOTPService = async (reqBody: validationVerifyOTPType) => {
  // 1: Check if user exists
  const user = await UserModel.findOne({ email: reqBody.email });

  if (!user) {
    throw new Error("User already exists");
  }

  if (!user.otpExpiry || new Date(user.otpExpiry) < new Date()) {
    throw new Error("OTP has expired");
  }

  if (user.otp !== reqBody.otp) {
    throw new Error("Invalid OTP");
  }

  user.otp = null;
  user.otpExpiry = null;
  user.isEmailVerified = true;

  await user.save();

  return {};
};

// FUNCTION
export const signinService = async (reqBody: validationSignInType) => {
  // take
  const { email, password } = reqBody;

  // Find user
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token (hashed)
  await storeRefreshToken(user, refreshToken);

  return { accessToken, refreshToken };
};

// FUNCTION
export const rotateService = async (req: Request) => {
  // 1 : take refresh token out
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new Error("Refresh token missing");
  }

  // 2 : Verify refresh token
  const decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as {
    userId: string;
  };

  // 3 : Find user
  const user = await UserModel.findById(decoded.userId);

  if (!user) {
    throw new Error("Invalid refresh token");
  }

  // 4 : Check if refresh token exists in DB (compare hashed)
  const hashedToken = await bcrypt.hash(refreshToken, 10);

  const tokenExists = user.refreshToken === hashedToken;

  if (!tokenExists) {
    throw new Error("Invalid refresh token");
  }

  // Generate new access token
  const newAccessToken = generateAccessToken(user);

  const newRefreshToken = generateRefreshToken(user);

  await storeRefreshToken(user, newRefreshToken);

  return { newAccessToken, newRefreshToken };
};

// FUNCTION
export const signoutService = async (req: Request) => {
  // 1 : take refresh token
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  // 2 : decode it
  const decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as {
    userId: string;
  };

  // 3 : find that user
  const user = await UserModel.findById(decoded.userId);

  // 4 : has token
  const hashedToken = await bcrypt.hash(refreshToken, 10);

  if (!user || user.refreshToken !== hashedToken) {
    throw new Error("Invalid refresh token");
  }

  user.refreshToken = null;

  await user.save();

  return;
};
