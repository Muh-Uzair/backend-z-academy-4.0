import { Document, model, Schema, Types } from "mongoose";

export enum MessageType {
  TEXT = "text",
  FILE = "file",
}

export interface IMessage extends Document {
  conversation: Types.ObjectId;
  sender: {
    id: Types.ObjectId;
    fullName: string;
  };
  receiver: {
    id: Types.ObjectId;
    fullName: string;
  } | null; // null allowed
  content: string;
  messageType: MessageType;
}

const messageParticipantSchema = new Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: [true, "Conversation ID is required"],
      index: true,
    },

    sender: {
      type: messageParticipantSchema,
      required: [true, "Sender is required"],
    },

    receiver: {
      type: messageParticipantSchema,
      default: null,
    },

    content: {
      type: String,
      required: [true, "Message content is required"],
      maxlength: [5000, "Message cannot be more than 5000 characters"],
    },

    messageType: {
      type: String,
      enum: Object.values(MessageType),
      default: MessageType.TEXT,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for fast chat history retrieval
messageSchema.index({ conversation: 1, createdAt: 1 });

const MessageModel = model<IMessage>("Message", messageSchema);

export default MessageModel;
