import { z } from "zod";
import { Types } from "mongoose";
import { MessageType } from "./messages.model";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  error: "Invalid ObjectId",
});

const messageParticipantSchema = z
  .object({
    id: objectIdSchema,
    fullName: z.string().min(1, { message: "Full name is required" }).trim(),
  })
  .strict();

export const validationCreateMessage = z
  .object({
    conversation: objectIdSchema,
    sender: messageParticipantSchema,
    receiver: messageParticipantSchema.nullable(),

    content: z
      .string()
      .min(1, { message: "Message content is required" })
      .max(5000, { message: "Message cannot be more than 5000 characters" })
      .trim(),

    messageType: z.enum(MessageType),
  })
  .strict();

export const validationGetAllMessagesOnConversationId = z
  .object({
    conversationId: objectIdSchema,
  })
  .strict();
