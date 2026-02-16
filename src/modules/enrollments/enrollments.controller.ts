import { Request, Response } from "express";
import { createEnrollmentService } from "./enrollments.service";

// FUNCTION
export const createEnrollment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log("Here 2 -----------------------------------------\n");
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
