import express, { Router } from "express";
import catchAsync from "@/utils/catchAsync";
import { validation } from "@/utils/validation";
import { validationCreateCourse } from "./courses.validation";
import { createCourse } from "./courses.controller";
import { restrictTo, verifyAccessToken } from "../auth";
import { UserRoles } from "../users/users.model";

const coursesTouter: Router = express.Router();

// route : root/api/v1/courses
coursesTouter
  .route("/")
  .post(
    verifyAccessToken,
    restrictTo([UserRoles.INSTRUCTOR as string]),
    validation(validationCreateCourse),
    catchAsync(createCourse),
  );

export default coursesTouter;
