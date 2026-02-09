import catchAsync from "@/utils/catchAsync";
import express, { Router } from "express";
import { putObjectCommand } from "./s3.controller";
import { validation } from "@/utils/validation";
import { validationPutObjectCommand } from "./s3.validation";
import { verifyAccessToken } from "../auth";

const s3Routes: Router = express.Router();

// route : root/api/v1/s3

s3Routes
  .route("/putObjectCommand")
  .post(
    verifyAccessToken,
    validation(validationPutObjectCommand),
    catchAsync(putObjectCommand),
  );

export default s3Routes;
