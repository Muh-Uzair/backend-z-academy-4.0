import { Request, Response } from "express";
import {
  createEnrollmentService,
  getAllEnrollmentsService,
} from "./enrollments.service";

// FUNCTION
export const createEnrollment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // pass control to service
  const result = await createEnrollmentService(req.body);

  // send response
  res.status(201).json({
    status: "success",
    message: "Create course successful",
    data: result,
  });

  return;
};

// FUNCTIONS
export const getAllEnrollments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // pass control to service
  const result = await getAllEnrollmentsService();

  // send response
  res.status(200).json({
    status: "success",
    message: "Get all enrollments successful",
    data: result,
  });

  return;
};
