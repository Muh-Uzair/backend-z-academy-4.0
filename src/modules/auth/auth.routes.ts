import express, { Router } from "express";
import { rotate, signin, signout, signup, verifyOTP } from "./auth.controller";
import catchAsync from "@/utils/catchAsync";
import { validation } from "@/utils/validation";
import {
  validationSignIn,
  validationSignUp,
  validationVerifyOTP,
} from "./auth.validation";

const router: Router = express.Router();

// route : root/api/v1/auth

router.route("/signup").post(validation(validationSignUp), catchAsync(signup));
router
  .route("/verify-otp")
  .post(validation(validationVerifyOTP), catchAsync(verifyOTP));
router.route("/signin").post(validation(validationSignIn), catchAsync(signin));
router.route("/rotate").post(catchAsync(rotate));
router.route("/signout").post(catchAsync(signout));

export default router;
