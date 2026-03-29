import { Request, Response } from "express";
import {
  createCourseService,
  getAllCoursesService,
  getCourseOnIdService,
  getCourseStudentInstructorListService,
} from "./courses.service";
import { IUser } from "../users/users.model";
import {
  validationGetCourseOnIdType,
  validationGetCourseStudentInstructorListType,
} from "./courses.types";

// FUNCTION
export const createCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // pass control to service
  const result = await createCourseService(req.body, req.user as IUser);

  // send response
  res.status(201).json({
    status: "success",
    message: "Create course successful",
    data: result,
  });

  return;
};

// FUNCTION
export const getAllCourses = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // pass control to service
  const result = await getAllCoursesService();

  // send response
  res.status(201).json({
    status: "success",
    message: "Get all courses successful",
    data: result,
  });

  return;
};

// FUNCTION
export const getCourseOnId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // pass control to service
  const result = await getCourseOnIdService(
    req.params as validationGetCourseOnIdType,
  );

  // send response
  res.status(201).json({
    status: "success",
    message: "Get all courses successful",
    data: result,
  });

  return;
};

// FUNCTION
export const getCourseStudentInstructorList = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await getCourseStudentInstructorListService(req,
    req.params as validationGetCourseStudentInstructorListType,
  );

  res.status(200).json({
    status: "success",
    message: "Get course student instructor list successful.",
    data: result,
  });

  return;
};
