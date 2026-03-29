import { Document, model, Schema, Types } from "mongoose";

export enum ConversationType {
  COURSE_PUBLIC = "course_public",
  PRIVATE_1V1 = "private_1v1",
}

export interface IConversation extends Document {
  conversationType: ConversationType;
  course?: Types.ObjectId;
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
      required: [true, "Course ID is required for course public conversations"],
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

conversationSchema.index({ course: 1 }, { unique: true });

const ConversationModel = model<IConversation>(
  "Conversation",
  conversationSchema,
);

export default ConversationModel;
