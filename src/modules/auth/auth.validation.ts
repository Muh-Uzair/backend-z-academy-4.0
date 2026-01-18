import { z } from "zod";

export const userRoleEnum = z.enum(["student", "instructor", "academy"]);

export const validationSignUp = z
  .object({
    fullName: z
      .string()
      .min(2, { message: "Full name must be at least 2 characters" })
      .max(100, { message: "Full name too long" }),
    email: z.email({ message: "Invalid email address" }).toLowerCase(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(100),
    role: userRoleEnum,
  })
  .strict();

export const validationVerifyOTP = z
  .object({
    email: z.email({ message: "Invalid email address" }).toLowerCase(),
    otp: z.string(),
  })
  .strict();

export const validationSignIn = z
  .object({
    email: z.email({ message: "Invalid email address" }).toLowerCase(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(100),
  })
  .strict();
