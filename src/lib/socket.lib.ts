import { Server } from "socket.io";
import Redis from "ioredis";
import MessageModel, { IMessage } from "@/modules/messages/messages.model";
import { validationCreateMessage } from "@/modules/messages/messages.validation";
import { env } from "@/config/env";

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

          socket.join(roomName);
        },
      );

      // DIVIDER sending the message to the course room
      socket.on(
        "event:course-message",
        async (data: {
          conversation: string;
          sender: string;
          receiver: null;
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

      socket.on(
        "event:join-course-private-room",
        (data: Omit<IMessage, "conversation" | "content" | "messageType">) => {
          console.log(
            "join course private room ---------------------------------------\n",
            data,
          );

          // 1 : we need to check wether conversation for these 2 users exists or not

          // 2 : join the user into that conversation
        },
      );

      socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id);
      });
    });
  }
}

export default SocketLib;
