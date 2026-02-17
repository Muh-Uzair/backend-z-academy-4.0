// import CourseModel from "./courses.model";

import EnrollmentModel from "./enrollments.model";
import { validationCreateEnrollmentType } from "./enrollments.types";

// FUNCTION
export const createEnrollmentService = async (
  reqBody: validationCreateEnrollmentType,
) => {
  const newEnrollment = await EnrollmentModel.create(reqBody);

  return { enrollment: newEnrollment };
};

// FUNCTION
export const getAllEnrollmentsService = async () => {
  const enrollments = await EnrollmentModel.find({})
    .populate("instructor", "_id fullName")
    .populate("student", "_id fullName")
    .populate("course", "_id title");

  return { enrollments };
};
