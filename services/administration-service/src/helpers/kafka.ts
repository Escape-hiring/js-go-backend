import { Kafka } from "kafkajs";
import { logger } from "./logger";

const KAFKA_URI = process.env["KAFKA_URI"] || "localhost:9092";

const kafka = new Kafka({
  clientId: "administration",
  brokers: [KAFKA_URI],
});

export const producer = kafka.producer();

producer.connect();

producer.on("producer.connect", () => {
  logger.success(`Kafka producer connected to ${KAFKA_URI}`);
});

producer.on("producer.disconnect", () => {
  logger.warn("Kafka producer disconnected.");
});

export const sendMessage = async (topic: string, message: any) => {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  } catch (error) {
    logger.error(error);
  }
};

process.on("SIGINT", async () => {
  logger.warn("Caught SIGINT signal, disconnecting Kafka producer.");
  await producer.disconnect();
});

process.on("SIGTERM", async () => {
  logger.warn("Caught SIGTERM signal, disconnecting Kafka producer.");
  await producer.disconnect();
});
