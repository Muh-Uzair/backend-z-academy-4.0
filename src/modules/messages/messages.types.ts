import { z } from "zod";
import { validationGetAllMessagesOnConversationId } from "./messages.validation";

export type validationGetAllMessagesOnConversationIdType = z.infer<
  typeof validationGetAllMessagesOnConversationId
>;
