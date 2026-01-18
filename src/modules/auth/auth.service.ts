import UserModel from "../users/users.model";
import { validationSignUpType } from "./auth.types";
import bcrypt from "bcrypt";
import { generateOtp } from "./auth.utils";
import { sendOTPEmail } from "@/lib/email.lib";

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
