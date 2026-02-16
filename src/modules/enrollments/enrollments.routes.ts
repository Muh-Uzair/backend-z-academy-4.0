import express, { Router, Request, Response, NextFunction } from "express";
import catchAsync from "@/utils/catchAsync";
import { verifyAccessToken } from "../auth";
import { createEnrollment } from "./enrollments.controller";
import { validation } from "@/utils/validation";
import { validationCreateEnrollment } from "./enrollments.validation";

const enrollmentRouter: Router = express.Router();

enrollmentRouter.use((req: Request, res: Response, next: NextFunction) => {
  console.log("Here --------------------------------------------\n", req.body);

  next();
});

// route : root/api/v1/enrollments
enrollmentRouter
  .route("/")
  .post(
    verifyAccessToken,
    validation(validationCreateEnrollment),
    catchAsync(createEnrollment),
  );

export default enrollmentRouter;
