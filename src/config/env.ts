import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3000"),
  FRONT_END_URL: z.string().url().default("http://localhost:3000"),
  MONGO_DB_CONNECTION_STRING: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_PASS: z.string(),
  ACCESS_TOKEN_SECRET: z
    .string() 
    .min(32, "ACCESS_TOKEN_SECRET must be at least 32 characters"),
  REFRESH_TOKEN_SECRET: z
    .string()
    .min(32, "ACCESS_TOKEN_SECRET must be at least 32 characters"),
  ACCESS_TOKEN_EXPIRY: z.number().default(54000000),
  REFRESH_TOKEN_EXPIRY: z.number().default(604800000),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse({
      ...process.env,
      ACCESS_TOKEN_EXPIRY: Number(process.env.ACCESS_TOKEN_EXPIRY),
      REFRESH_TOKEN_EXPIRY: Number(process.env.REFRESH_TOKEN_EXPIRY),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((err: z.ZodIssue) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");
      throw new Error(`Invalid environment variables:\n${errorMessages}`);
    }
    throw error;
  }
}

export const env = validateEnv();
export type { Env };
