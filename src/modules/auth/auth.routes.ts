import express, { Router } from "express";
import { rotate, signin, signout, signup, verifyOTP } from "./auth.controller";
import catchAsync from "@/utils/catchAsync";
import { validation } from "@/utils/validation";
import {
  validationSignIn,
  validationSignUp,
  validationVerifyOTP,
} from "./auth.validation";

const authRouter: Router = express.Router();

// route : root/api/v1/auth

authRouter
  .route("/signup")
  .post(validation(validationSignUp), catchAsync(signup));
authRouter
  .route("/verify-otp")
  .post(validation(validationVerifyOTP), catchAsync(verifyOTP));
authRouter
  .route("/signin")
  .post(validation(validationSignIn), catchAsync(signin));
authRouter.route("/rotate").post(catchAsync(rotate));
authRouter.route("/signout").post(catchAsync(signout));

export { authRouter };
