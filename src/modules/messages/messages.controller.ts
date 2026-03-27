import { Request, Response } from "express";
import { getAllMessagesOnConversationIdService } from "./messages.service";
import { validationGetAllMessagesOnConversationIdType } from "./messages.types";

// FUNCTION
export const getAllMessagesOnConversationId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // pass control to service
  const result = await getAllMessagesOnConversationIdService(
    req.params as validationGetAllMessagesOnConversationIdType,
  );

  // send response
  res.status(200).json({
    status: "success",
    message: "Get all messages on conversation id successful.",
    data: result,
  });

  return;
};
