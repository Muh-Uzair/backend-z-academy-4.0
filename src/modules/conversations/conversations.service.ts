import AppError from "@/utils/appError.utils";
import ConversationModel, { ConversationType } from "./conversations.model";
import { Types } from "mongoose";

// FUNCTION
export const createConversationService = async ({
  conversationType,
  course,
}: {
  conversationType: ConversationType;
  course: Types.ObjectId;
}) => {
  // check if the course id existing
  const existingConversation = await ConversationModel.findOne({ course });

  if (existingConversation) {
    throw new AppError("You already have a conversation for this course", 409);
  }

  // create course
  const newConversation = await ConversationModel.create({
    conversationType,
    course,
  });

  return {
    conversation: newConversation,
  };
};