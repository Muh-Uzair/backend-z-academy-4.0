import { z } from "zod";
import {
  validationCreateCourse,
  validationGetCourseOnId,
  validationGetCourseStudentInstructorList,
} from "./courses.validation";

export type validationCreateCourseType = z.infer<typeof validationCreateCourse>;

export type validationGetCourseOnIdType = z.infer<
  typeof validationGetCourseOnId
>;

export type validationGetCourseStudentInstructorListType = z.infer<
  typeof validationGetCourseStudentInstructorList
>;
