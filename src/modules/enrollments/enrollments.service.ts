// import CourseModel from "./courses.model";

import AppError from "@/utils/appError.utils";
import { IUser } from "../users/users.model";
import EnrollmentModel from "./enrollments.model";
import { validationCreateEnrollmentType } from "./enrollments.types";
import { Request } from "express";

// FUNCTION
export const createEnrollmentService = async (
  reqBody: validationCreateEnrollmentType,
) => {
  console.log("reqBody -----------------------------\n", reqBody);

  const newEnrollment = await EnrollmentModel.create(reqBody);

  return { enrollment: newEnrollment };
};

// FUNCTION
export const getAllEnrollmentsService = async (req: Request) => {
  // 1 : take user out of request
  const user: IUser | undefined = req.user;

  if (!user) {
    throw new AppError("Your not authenticated", 401);
  }

  let enrollments: any = [];

  if (user.role === "instructor") {
    const instructorId = user?._id;

    enrollments = await EnrollmentModel.find({ instructor: instructorId })
      .populate("instructor", "_id fullName")
      .populate("course", "_id title");
  } else if (user?.role === "student") {
    const studentId = user?._id;

    enrollments = await EnrollmentModel.find({ student: studentId })
      .populate("student", "_id fullName")
      .populate("instructor", "_id fullName")
      .populate("course", "_id title");
  }

  return { enrollments };
};
