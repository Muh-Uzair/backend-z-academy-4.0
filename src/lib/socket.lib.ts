import { Server } from "socket.io";
import Redis from "ioredis";
import MessageModel from "@/modules/messages/messages.model";
import { validationCreateMessage } from "@/modules/messages/messages.validation";

const pub = new Redis({
  host: "valkey-2321c90-muhammaduzair1062001-8671.c.aivencloud.com",
  port: 16725,
  username: "default",
  password: "AVNS_RiGXzlOW__uNDmyBYpo",
});

const sub = new Redis({
  host: "valkey-2321c90-muhammaduzair1062001-8671.c.aivencloud.com",
  port: 16725,
  username: "default",
  password: "AVNS_RiGXzlOW__uNDmyBYpo",
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
        async ({ courseId }: { courseId: string }) => {
          const roomName = `course:${courseId}`;
          socket.join(roomName);
        },
      );

      // DIVIDER sending the message to the course room
      socket.on(
        "event:course-message",
        async (data: {
          conversationId: string;
          senderId: string;
          receiverId: null;
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

          // 4 : save to db
          await MessageModel.create({
            conversationId: validatedData.conversationId,
            senderId: validatedData.senderId,
            receiverId: null,
            content: validatedData.content,
            messageType: validatedData.messageType,
          });

          // 5 : broadcast into room
          const roomName = `course:${validatedData.conversationId}`;

          socket.to(roomName).emit("event:course-message", {
            conversationId: validatedData.conversationId,
            senderId: validatedData.senderId,
            content: validatedData.content,
            messageType: validatedData.messageType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          // TODO: publish into kafka
        },
      );

      socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id);
      });
    });
  }
}

export default SocketLib;
