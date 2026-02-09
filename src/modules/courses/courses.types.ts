import { z } from "zod";
import { validationCreateCourse } from "./courses.validation";

export type validationCreateCourseType = z.infer<typeof validationCreateCourse>;
