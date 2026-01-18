import { z } from "zod";
import {
  validationSignIn,
  validationSignUp,
  validationVerifyOTP,
} from "./auth.validation";

export type validationSignUpType = z.infer<typeof validationSignUp>;
export type validationVerifyOTPType = z.infer<typeof validationVerifyOTP>;
export type validationSignInType = z.infer<typeof validationSignIn>;
