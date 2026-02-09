import z from "zod";
import { validationPutObjectCommand } from "./s3.validation";

export type validationPutObjectCommandType = z.infer<
  typeof validationPutObjectCommand
>;
