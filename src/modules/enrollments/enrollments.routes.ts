import express, { Router } from "express";
import catchAsync from "@/utils/catchAsync.utils";
import { verifyAccessToken } from "../auth";
import { createEnrollment, getAllEnrollments } from "./enrollments.controller";
import { validation } from "@/utils/validation";
import { validationCreateEnrollment } from "./enrollments.validation";

const enrollmentRouter: Router = express.Router();

// route : root/api/v1/enrollments
enrollmentRouter
  .route("/")
  .post(
    verifyAccessToken,
    validation(validationCreateEnrollment),
    catchAsync(createEnrollment),
  )
  .get(verifyAccessToken, catchAsync(getAllEnrollments));

export default enrollmentRouter;
