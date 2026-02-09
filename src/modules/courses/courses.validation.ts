import z from "zod";
import { CourseCategory, CourseLevel } from "./courses.model";

export const validationCreateCourse = z
  .object({
    title: z
      .string()
      .min(5, { error: "Title must be at least 5 characters" })
      .max(100, { error: "Title cannot exceed 100 characters" }),
    description: z
      .string()
      .min(20, { error: "Description must be at least 20 characters" }),
    price: z
      .number({ error: "Price must be a number" })
      .min(0, { error: "Price cannot be negative" }),

    level: z.enum(CourseLevel, { error: "Please select a level" }),
    category: z.enum(CourseCategory, { error: "Please select a category" }),
    thumbnail: z.url({ error: "Please enter a valid URL" }),
  })
  .strict();
