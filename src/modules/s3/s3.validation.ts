import z from "zod";

export const validationPutObjectCommand = z
  .object({
    fileName: z.string(),
    fileType: z.string(),
    key: z.string(),
  })
  .strict();
