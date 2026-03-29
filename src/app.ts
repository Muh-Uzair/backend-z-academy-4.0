import express, { NextFunction, Response, Request } from "express";
import cors from "cors";
import { env } from "./config/env";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { authRouter } from "@/modules/auth";
import { coursesRouter } from "@/modules/courses";
import { enrollmentRouter } from "@/modules/enrollments";
import { messagesRouter } from "@/modules/messages";
import AppError from "./utils/appError.utils";
import { globalErrorHandler } from "./modules/error/error.controller";
import s3Router from "@/modules/s3/s3.routes";

process.on("uncaughtException", (err: Error) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// List of allowed origins (frontend URLs that are permitted to make requests)
const allowedOrigins = [env.FRONT_END_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin
      // (important for mobile apps, curl, Postman, server-to-server calls, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Check if the request origin is in the allowed list
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());



// morgan logger
if (env.NODE_ENV === "development") {
  app.use(
    morgan("dev", {
      skip: (req) => req.method === "OPTIONS",
    }),
  );
} else {
  app.use(morgan("combined"));
}

// Routes
app.get("/", (_req, res) => {
  res.json({ message: "Hello this is zAcademy backend" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/s3", s3Router);
app.use("/api/v1/courses", coursesRouter);
app.use("/api/v1/enrollments", enrollmentRouter);
app.use("/api/v1/messages", messagesRouter);

app.all(/.*/, (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

process.on("unhandledRejection", (err: Error) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

export default app;
