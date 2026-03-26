import { Document, model, Schema, Types } from "mongoose";

export enum MessageType {
  TEXT = "text",
  FILE = "file",
}

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId | null; // null allowed
  content: string;
  messageType: MessageType;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: [true, "Conversation ID is required"],
      index: true,
    },

    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
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
messageSchema.index({ conversationId: 1, createdAt: 1 });

const MessageModel = model<IMessage>("Message", messageSchema);

export default MessageModel;
