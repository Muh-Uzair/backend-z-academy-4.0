import express, { Router } from "express";
import catchAsync from "@/utils/catchAsync.utils";
import { validation, validationParams } from "@/utils/validation";
import {
  validationCreateCourse,
  validationGetCourseOnId,
  validationGetCourseStudentInstructorList,
} from "./courses.validation";
import {
  createCourse,
  getAllCourses,
  getCourseOnId,
  getCourseStudentInstructorList,
} from "./courses.controller";
import { restrictTo, verifyAccessToken } from "../auth";
import { UserRoles } from "../users/users.model";

const coursesRouter: Router = express.Router();

// route : root/api/v1/courses
coursesRouter
  .route("/")
  .post(
    verifyAccessToken,
    restrictTo([UserRoles.INSTRUCTOR as string]),
    validation(validationCreateCourse),
    catchAsync(createCourse),
  )
  .get(catchAsync(getAllCourses));

coursesRouter
  .route("/get-course-student-instructor-list/:course")
  .get(
    verifyAccessToken,
    validationParams(validationGetCourseStudentInstructorList),
    catchAsync(getCourseStudentInstructorList),
  );

coursesRouter
  .route("/:id")
  .get(
    verifyAccessToken,
    validationParams(validationGetCourseOnId),
    catchAsync(getCourseOnId),
  );

export { coursesRouter };
export default coursesRouter;
