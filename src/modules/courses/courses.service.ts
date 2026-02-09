// import CourseModel from "./courses.model";
import AppError from "@/utils/appError";
import { IUser } from "../users/users.model";
import CourseModel from "./courses.model";
import { validationCreateCourseType } from "./courses.types";

// FUNCTION
export const createCourseService = async (
  reqBody: validationCreateCourseType,
  user: IUser,
) => {
  // check if the course id existing
  const existingCourse = await CourseModel.findOne({
    title: reqBody.title.trim(),
    instructor: user?._id,
  });

  if (existingCourse) {
    throw new AppError("You already have a course with this title", 409);
  }

  // create course
  const newCourse = await CourseModel.create({
    ...reqBody,
    instructor: user?._id,
  });

  return {
    course: newCourse,
  };
};
