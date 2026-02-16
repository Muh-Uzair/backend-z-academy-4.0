import { z } from "zod";
import { validationCreateEnrollment } from "./enrollments.validation";

export type validationCreateEnrollmentType = z.infer<
  typeof validationCreateEnrollment
>;
