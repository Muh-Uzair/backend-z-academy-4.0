import express, { Router } from "express";
import catchAsync from "@/utils/catchAsync.utils";
import { validationParams } from "@/utils/validation";
import { verifyAccessToken } from "../auth";
import { getAllMessagesOnConversationId } from "./messages.controller";
import { validationGetAllMessagesOnConversationId } from "./messages.validation";

const messagesRouter: Router = express.Router();

// route : root/api/v1/messages

messagesRouter
  .route("/:conversationId")
  .get(
    verifyAccessToken,
    validationParams(validationGetAllMessagesOnConversationId),
    catchAsync(getAllMessagesOnConversationId),
  );

export default messagesRouter;
