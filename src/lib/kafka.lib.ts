import { IMessagePayload } from "@/modules/messages";
import { Kafka, Producer } from "kafkajs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "@/config/env";
import MessageModel from "@/modules/messages/messages.model";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const kafka = new Kafka({
  brokers: [`${env.KAFKA_BROKER}`],
  ssl: {
    ca: [fs.readFileSync(path.resolve(__dirname, "../../ca.pem"), "utf-8")],
  },
  sasl: {
    mechanism: "plain" as const,
    username: env.KAFKA_USERNAME,
    password: env.KAFKA_PASSWORD,
  },
  retry: {
    initialRetryTime: 300,
    retries: 5,
  },
});

let producer: null | Producer = null;

async function createProducer() {
  if (producer) return producer;

  const _producer = kafka.producer();

  try {
    await _producer.connect();
    producer = _producer;
    return producer;
  } catch (err) {
    console.error("Kafka producer connection failed:", err);
    throw err; // let callers handle it gracefully
  }
}

export async function produceMessagesKafka(message: IMessagePayload) {
  // 1 : create  a producer
  const producer = await createProducer();
  await producer.send({
    messages: [
      { key: `message-${Date.now()}`, value: JSON.stringify(message) },
    ],
    topic: "MESSAGES",
  });

  return;
}

export async function consumeMessagesKafka() {
  const consumer = kafka.consumer({ groupId: "messages-consumer-group" });
  await consumer.connect();
  await consumer.subscribe({ topic: "MESSAGES" });

  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      if (!message.value) return;

      try {
        const kafkaMessage = JSON.parse(message.value.toString());

        await MessageModel.create({
          conversation: new mongoose.Types.ObjectId(kafkaMessage.conversation),
          sender: {
            id: new mongoose.Types.ObjectId(kafkaMessage.sender.id),
            fullName: kafkaMessage.sender.fullName,
          },
          receiver:
            kafkaMessage.receiver === null
              ? null
              : {
                  id: new mongoose.Types.ObjectId(kafkaMessage.receiver.id),
                  fullName: kafkaMessage.receiver.fullName,
                },
          content: kafkaMessage.content,
          messageType: kafkaMessage.messageType,
        });
      } catch (error: unknown) {
        console.error("error in parsing kafka message ", error);
        pause();

        setTimeout(() => {
          consumer.resume([{ topic: "MESSAGES" }]);
        }, 60 * 1000);
      }
    },
  });
}

export default kafka;
