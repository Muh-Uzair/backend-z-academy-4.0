import express, { NextFunction, Response, Request } from "express";
import cors from "cors";
import { env } from "./config/env";
import morgan from "morgan";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRouter from "@/modules/auth/auth.routes";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use(
  cors({
    origin: env.FRONT_END_URL,
    credentials: true,
  }),
);

app.use(cookieParser());

// mongodb connection
app.use((req: Request, res: Response, next: NextFunction) => {
  mongoose
    .connect(env.MONGO_DB_CONNECTION_STRING, {
      bufferCommands: false,
    })
    .then(() => {
      console.log("Database connection successful");
      next();
    })
    .catch((err) => {
      console.error("Database connection error:", err);
      res.status(500).json({ message: "Error connecting to mongodb" });
    });
});

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

// This would cause an error (unused variable)
// const unusedVar = "test";

export default app;
