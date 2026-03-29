import { Server } from "socket.io";
import Redis from "ioredis";
import MessageModel from "@/modules/messages/messages.model";
import { validationCreateMessage } from "@/modules/messages/messages.validation";
import { env } from "@/config/env";
import generatePrivateConversationId from "@/utils/generatePrivateConversationId";
import ConversationModel, {
  ConversationType,
  IConversation,
} from "@/modules/conversations/conversations.model";
import { Types } from "mongoose";

const pub = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  username: env.REDIS_USERNAME,
  password: env.REDIS_PASSWORD,
});

const sub = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  username: env.REDIS_USERNAME,
  password: env.REDIS_PASSWORD,
});

// DIVIDER main class
class SocketLib {
  // 1 : socket variables
  private _io!: Server;

  // 2 : constructor
  constructor() {
    console.log("Socket server init");

    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });

    sub.subscribe("MESSAGES");
  }

  // 3 : getters and setters
  get io() {
    return this._io;
  }

  // 4 : methods
  public initListeners() {
    // 1 : testing purposes
    console.log("Socket listeners init");

    const io = this.io;

    // 2 : listening for messages from redis
    sub.on("MESSAGES", (channel, message) => {
      console.log("New message from redis ===>", message);

      io.emit("event:message", JSON.parse(message));
    });

    // 3 :  DIVIDER DIVIDER DIVIDER main socket connection
    io.on("connection", (socket) => {
      console.log("New client connected", socket.id);

      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New message arrived message ====>", message);

        await pub.publish("MESSAGES", JSON.stringify({ message }));
      });

      // DIVIDER joining the course room
      socket.on(
        "event:join-course-room",
        async ({ conversationId }: { conversationId: string }) => {
          const roomName = `course:${conversationId}`;

          console.log(
            "joinRoom ----------------------------------\n",
            roomName,
          );

          const existingPrivateRooms = Array.from(socket.rooms).filter((room) =>
            room.startsWith("course:"),
          );

          await Promise.all(
            existingPrivateRooms.map((room) => socket.leave(room)),
          );

          socket.join(roomName);
        },
      );

      // DIVIDER sending the message to the course room
      socket.on(
        "event:course-message",
        async (data: {
          conversation: string;
          sender: {
            id: string;
            fullName: string;
          };
          receiver: {
            id: string;
            fullName: string;
          };
          content: string;
          messageType: "text" | "file";
        }) => {
          // 1 : validate incoming data
          const validationResult = validationCreateMessage.safeParse(data);

          // 2 : if validation fails
          if (!validationResult.success) {
            // ZodError instance
            const { issues } = validationResult.error;

            console.error("Validation Error:", issues);

            socket.emit("event:course-message-error", {
              message: "Invalid message data",
              errors: issues.map((iss) => ({
                path: iss.path,
                code: iss.code,
                message: iss.message,
              })),
            });

            return;
          }

          // 3 : if validation passes
          const validatedData = validationResult.data;

          // 4 : check that user has joined or not
          const roomName = `course:${validatedData.conversation}`;
          const isJoined = socket.rooms.has(roomName);

          if (!isJoined) {
            socket.emit("event:course-message-error", {
              message: "You are not connected to this conversation room",
            });

            return;
          }

          // 5 : save to db
          const newMessage = await MessageModel.create({
            conversation: validatedData.conversation,
            sender: validatedData.sender,
            receiver: null,
            content: validatedData.content,
            messageType: validatedData.messageType,
          });

          // 6 : broadcast into room
          console.log(
            "roomName ----------------------------------\n",
            roomName,
          );

          io.to(roomName).emit("event:course-message", newMessage);

          // TODO: publish into kafka
        },
      );

      // DIVIDER leaving course room
      socket.on(
        "event:leave-course-room",
        async ({ conversationId }: { conversationId: string }) => {
          const roomName = `course:${conversationId}`;

          console.log(
            "leaveRoom ----------------------------------\n",
            roomName,
          );

          socket.leave(roomName);
        },
      );

      // DIVIDER joining private course room
      socket.on(
        "event:join-course-private-room",
        async (data: {
          course: string;
          sender: {
            id: Types.ObjectId;
            fullName: string;
          };
          receiver: {
            id: Types.ObjectId;
            fullName: string;
          };
        }) => {
          console.log(data);
          // 1 : generate a unique conversation id
          const uniqueConversationId: string = generatePrivateConversationId(
            String(data.course),
            String(data.sender?.id),
            String(data.receiver?.id),
          );

          // 2 : check the conversation for this or create a new one
          let conversation: IConversation | null | unknown = null;

          conversation = await ConversationModel.findOne({
            privateChatConversationId: uniqueConversationId,
          });

          if (!conversation) {
            conversation = await ConversationModel.create({
              conversationType: ConversationType.PRIVATE_1V1,
              course: data.course,
              privateChatConversationId: uniqueConversationId,
              participants: [data.sender?.id, data.receiver?.id],
            });
          }

          if (!conversation) {
            throw new Error("Something went wrong while creating conversation");
          }

          // 3 : join the user into this conversation with room name as course-private:uniqueConversationId
          const roomName = `course-private:${(conversation as IConversation)._id}`;

          const existingPrivateRooms = Array.from(socket.rooms).filter((room) =>
            room.startsWith("course-private:"),
          );

          await Promise.all(
            existingPrivateRooms.map((room) => socket.leave(room)),
          );

          socket.join(roomName);

          // 4 : send conversation info to that exact user
          socket.emit("event:course-private-conversation-info", conversation);
        },
      );

      // DIVIDER listening for private message
      socket.on(
        "event:course-private-message",
        async (data: {
          conversation: string;
          sender: {
            id: string;
            fullName: string;
          };
          receiver: {
            id: string;
            fullName: string;
          };
          content: string;
          messageType: "text" | "file";
        }) => {
          const conversation = await ConversationModel.findOne({
            privateChatConversationId: data.conversation,
            conversationType: ConversationType.PRIVATE_1V1,
          });

          if (!conversation) {
            socket.emit("event:course-private-message-error", {
              message: "Private conversation not found",
            });

            return;
          }

          const validationResult = validationCreateMessage.safeParse({
            ...data,
            conversation: String(conversation._id),
          });

          if (!validationResult.success) {
            const { issues } = validationResult.error;

            console.error("Validation Error:", issues);

            socket.emit("event:course-private-message-error", {
              message: "Invalid private message data",
              errors: issues.map((iss) => ({
                path: iss.path,
                code: iss.code,
                message: iss.message,
              })),
            });

            return;
          }

          const validatedData = validationResult.data;

          const roomName = `course-private:${conversation._id}`;
          const isJoined = socket.rooms.has(roomName);

          if (!isJoined) {
            socket.emit("event:course-private-message-error", {
              message:
                "You are not connected to this private conversation room",
            });

            return;
          }

          const newMessage = await MessageModel.create({
            conversation: validatedData.conversation,
            sender: validatedData.sender,
            receiver: validatedData.receiver,
            content: validatedData.content,
            messageType: validatedData.messageType,
          });

          io.to(roomName).emit("event:course-private-message", newMessage);
        },
      );

      socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id);
      });
    });
  }
}

export default SocketLib;
