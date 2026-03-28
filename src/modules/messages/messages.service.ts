import MessageModel from "./messages.model";
import { validationGetAllMessagesOnConversationIdType } from "./messages.types";

// FUNCTION
export const getAllMessagesOnConversationIdService = async (
  reqParams: validationGetAllMessagesOnConversationIdType,
) => {
  const { conversationId } = reqParams;

  const allMessages = await MessageModel.find({
    conversation: conversationId,
  }).sort({
    createdAt: 1,
  });

  return {
    messages: allMessages,
  };
};
