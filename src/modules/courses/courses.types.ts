import { z } from "zod";
import {
  validationCreateCourse,
  validationGetCourseOnId,
} from "./courses.validation";

export type validationCreateCourseType = z.infer<typeof validationCreateCourse>;

export type validationGetCourseOnIdType = z.infer<
  typeof validationGetCourseOnId
>;
