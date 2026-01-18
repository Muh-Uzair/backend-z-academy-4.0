import { z } from "zod";
import { validationSignUp } from "./auth.validation";

export type validationSignUpType = z.infer<typeof validationSignUp>;
