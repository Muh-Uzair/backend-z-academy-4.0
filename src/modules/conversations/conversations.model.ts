import { Document, model, Schema, Types } from "mongoose";

export enum ConversationType {
  COURSE_PUBLIC = "course_public",
  PRIVATE_1V1 = "private_1v1",
}

export interface IConversation extends Document {
  conversationType: ConversationType;
  course?: Types.ObjectId;
  privateChatConversationId: string | undefined;
  participants?: Types.ObjectId[];
}

const conversationSchema = new Schema<IConversation>(
  {
    conversationType: {
      type: String,
      enum: Object.values(ConversationType),
      required: [true, "Conversation type is required"],
      lowercase: true,
    },

    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },

    privateChatConversationId: {
      type: String,
      required: [
        function () {
          return this.conversationType === ConversationType.PRIVATE_1V1;
        },
        "Unique private chat conversation id is required for private 1v1 conversations",
      ],
      unique: true,
      index: true,
    },

    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      required: [
        function () {
          return this.conversationType === ConversationType.PRIVATE_1V1;
        },
        "Participants are required for private 1v1 conversations",
      ],
    },
  },
  {
    timestamps: true,
  },
);

const ConversationModel = model<IConversation>(
  "Conversation",
  conversationSchema,
);

export default ConversationModel;
