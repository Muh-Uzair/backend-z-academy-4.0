import z from "zod";

export const validationCreateEnrollment = z
  .object({
    student: z.string(),
    course: z.string(),
    instructor: z.string(),

    enrollmentDate: z.string().datetime().pipe(z.coerce.date()),
    status: z.enum(["active", "completed", "dropped"]).default("active"),
    paymentStatus: z
      .enum(["paid", "pending", "failed", "refunded"])
      .default("paid"),

    amountPaid: z
      .number()
      .positive({ message: "Amount paid must be positive" }),
    originalPrice: z
      .number()
      .nonnegative({ message: "Original price cannot be negative" }),
  })
  .strict();
