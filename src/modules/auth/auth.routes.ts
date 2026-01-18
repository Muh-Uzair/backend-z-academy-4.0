import express, { Request, Response, NextFunction, Router } from "express";
import { signup } from "./auth.controller";
import catchAsync from "@/utils/catchAsync";
import { validation } from "@/utils/validation";
import { validationSignUp } from "./auth.validation";

const router: Router = express.Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  console.log("Auth Router");
  next();
});

// route : root/api/v1/auth

router.route("/signup").post(validation(validationSignUp), catchAsync(signup));

export default router;
