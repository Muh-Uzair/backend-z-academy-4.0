import { Server } from "socket.io";
import Redis from "ioredis";
import { IMessagePayload } from "@/modules/messages/messages.model";
import { validationCreateMessage } from "@/modules/messages/messages.validation";
import { env } from "@/config/env";
import generatePrivateConversationId from "@/utils/generatePrivateConversationId";
import ConversationModel, {
  ConversationType,
  IConversation,
} from "@/modules/conversations/conversations.model";
import { Types } from "mongoose";
import { produceMessagesKafka } from "./kafka.lib";

// ─── Redis Channels ────────────────────────────────────────────────────────────
// Each channel carries a { roomName, message } payload.
// All Socket.IO servers subscribe to these channels.
// When any server publishes, Redis fans it out to every server,
// and each server delivers the message to its own local room members.
const CHANNEL_COURSE = "COURSE_MESSAGES";
const CHANNEL_COURSE_PRIVATE = "COURSE_PRIVATE_MESSAGES";

// ─── Two Redis clients (required: a subscribed client cannot publish) ──────────
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

// ─── Main SocketLib class ──────────────────────────────────────────────────────
class SocketLib {
  private _io!: Server;

  constructor() {
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });

    // Subscribe to both channels once at startup.
    // Every server instance (A, B, C …) does the same,
    // so Redis will fan out to all of them.
    sub.subscribe(CHANNEL_COURSE, CHANNEL_COURSE_PRIVATE, (err) => {
      if (err) {
        console.error("Redis subscription error:", err);
      }
    });
  }

  get io() {
    return this._io;
  }

  public initListeners() {
    const io = this.io;

    // ─── Redis → Socket.IO delivery ─────────────────────────────────────────────
    // This fires on EVERY server instance whenever any server publishes.
    // Each server then delivers the message to whichever clients it holds
    // in that room locally.
    //
    // Fix: the correct event name is "message", NOT the channel name.
    sub.on("message", (channel: string, payload: string) => {
      try {
        const { roomName, message } = JSON.parse(payload);

        if (channel === CHANNEL_COURSE) {
          // Deliver to all clients in this course room on THIS server
          io.to(roomName).emit("event:course-message", message);
        }

        if (channel === CHANNEL_COURSE_PRIVATE) {
          // Deliver to all clients in this private room on THIS server
          io.to(roomName).emit("event:course-private-message", message);
        }
      } catch (err) {
        console.error("Failed to parse Redis message:", err);
      }
    });

    // ─── Socket.IO connection ────────────────────────────────────────────────────
    io.on("connection", (socket) => {
      // ── Join course (group) room ───────────────────────────────────────────────
      socket.on(
        "event:join-course-room",
        async ({ conversationId }: { conversationId: string }) => {
          try {
            const roomName = `course:${conversationId}`;

            // Leave any other course rooms before joining the new one
            const existingCourseRooms = Array.from(socket.rooms).filter(
              (room) => room.startsWith("course:"),
            );
            await Promise.all(
              existingCourseRooms.map((room) => socket.leave(room)),
            );

            socket.join(roomName);
          } catch (err) {
            console.error("event:join-course-room error:", err);
          }
        },
      );

      // ── Leave course room ──────────────────────────────────────────────────────
      socket.on(
        "event:leave-course-room",
        async ({ conversationId }: { conversationId: string }) => {
          try {
            const roomName = `course:${conversationId}`;
            socket.leave(roomName);
          } catch (err) {
            console.error("event:leave-course-room error:", err);
          }
        },
      );

      // ── Send course (group) message ────────────────────────────────────────────
      socket.on("event:course-message", async (data: IMessagePayload) => {
        try {
          // 1 : Validate
          const validationResult = validationCreateMessage.safeParse(data);

          if (!validationResult.success) {
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

          const validatedData = validationResult.data;
          const roomName = `course:${validatedData.conversation}`;

          // 2 : Make sure this socket is actually in the room
          if (!socket.rooms.has(roomName)) {
            socket.emit("event:course-message-error", {
              message: "You are not connected to this conversation room",
            });
            return;
          }

          // 3 : Persist to DB
          const newMessage = {
            conversation: validatedData.conversation,
            sender: validatedData.sender,
            receiver: null,
            content: validatedData.content,
            messageType: validatedData.messageType,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // 4 : Publish to Redis → all servers will deliver to their local room members
          //     This replaces the old direct io.to(roomName).emit() call so that
          //     clients on OTHER servers also receive the message.
          await pub.publish(
            CHANNEL_COURSE,
            JSON.stringify({ roomName, message: newMessage }),
          );

          await produceMessagesKafka(newMessage);
        } catch (err) {
          console.error("event:course-message error:", err);
          socket.emit("event:course-message-error", {
            message: "An internal error occurred",
          });
        }
      });

      // ── Join private 1-on-1 room ───────────────────────────────────────────────
      socket.on(
        "event:join-course-private-room",
        async (data: {
          course: string;
          sender: { id: Types.ObjectId; fullName: string };
          receiver: { id: Types.ObjectId; fullName: string };
        }) => {
          try {
            // 1 : Deterministic unique ID from course + both user IDs
            const uniqueConversationId = generatePrivateConversationId(
              String(data.course),
              String(data.sender?.id),
              String(data.receiver?.id),
            );

            // 2 : Find or create the conversation document
            const conversation =
              (await ConversationModel.findOne({
                privateChatConversationId: uniqueConversationId,
              })) ??
              (await ConversationModel.create({
                conversationType: ConversationType.PRIVATE_1V1,
                course: data.course,
                privateChatConversationId: uniqueConversationId,
                participants: [data.sender?.id, data.receiver?.id],
              }));

            if (!conversation) {
              throw new Error("Failed to find or create conversation");
            }

            // 3 : Join the room (leave any previous private rooms first)
            const roomName = `course-private:${(conversation as IConversation)._id}`;

            const existingPrivateRooms = Array.from(socket.rooms).filter(
              (room) => room.startsWith("course-private:"),
            );
            await Promise.all(
              existingPrivateRooms.map((room) => socket.leave(room)),
            );

            socket.join(roomName);

            // 4 : Confirm conversation info back to this client only
            socket.emit("event:course-private-conversation-info", conversation);
          } catch (err) {
            console.error("event:join-course-private-room error:", err);
            socket.emit("event:course-private-message-error", {
              message: "Failed to join private room",
            });
          }
        },
      );

      // ── Send private message ───────────────────────────────────────────────────
      socket.on(
        "event:course-private-message",
        async (data: {
          conversation: string; // privateChatConversationId
          sender: { id: string; fullName: string };
          receiver: { id: string; fullName: string };
          content: string;
          messageType: "text" | "file";
        }) => {
          try {
            // 1 : Resolve privateChatConversationId → actual conversation doc
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

            // 2 : Validate with the real _id substituted in
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

            // 3 : Make sure this socket is in the room
            if (!socket.rooms.has(roomName)) {
              socket.emit("event:course-private-message-error", {
                message:
                  "You are not connected to this private conversation room",
              });
              return;
            }

            // 4 : Persist to DB
            const newMessage = {
              conversation: validatedData.conversation,
              sender: validatedData.sender,
              receiver: validatedData.receiver,
              content: validatedData.content,
              messageType: validatedData.messageType,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // 5 : Publish to Redis → all servers deliver to their local private room members
            await pub.publish(
              CHANNEL_COURSE_PRIVATE,
              JSON.stringify({ roomName, message: newMessage }),
            );

            await produceMessagesKafka(newMessage);
          } catch (err) {
            console.error("event:course-private-message error:", err);
            socket.emit("event:course-private-message-error", {
              message: "An internal error occurred",
            });
          }
        },
      );
    });
  }
}

export default SocketLib;
