// import CourseModel from "./courses.model";

import EnrollmentModel from "./enrollments.model";
import { validationCreateEnrollmentType } from "./enrollments.types";

// FUNCTION
export const createEnrollmentService = async (
  reqBody: validationCreateEnrollmentType,
) => {
  const newCourse = await EnrollmentModel.create(reqBody);

  return { course: newCourse };
};
