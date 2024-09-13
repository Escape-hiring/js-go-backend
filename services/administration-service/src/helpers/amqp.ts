import * as amqp from "amqplib/callback_api";
import { logger } from "./logger";
import { z } from "zod";

const topics = ["user.created"] as const;
export const schemas: Record<(typeof topics)[number], z.Schema> = {
  "user.created": z.object({
    timestampIso: z.string(),
    user: z.object({
      id: z.string(),
      email: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  }),
};

const connectAMQP = () =>
  new Promise<amqp.Channel>((resolve, reject) => {
    const rabbitMqUrl = process.env["RABBITMQ_URL"] || "amqp://localhost";
    logger.log(`Connecting to RabbitMQ at ${rabbitMqUrl}`);

    amqp.connect(rabbitMqUrl, (connectionError, connection) => {
      if (connectionError) reject(connectionError);

      connection.createChannel((channelError, channel) => {
        if (channelError) reject(channelError);

        for (const topic of topics)
          channel.assertQueue(topic, { durable: false });

        return resolve(channel);
      });

      const closeConnection = (signal: string) => {
        logger.warn(`Received ${signal}: closing RabbitMQ connection`);
        connection.close((err) => {
          if (err) logger.error("Error closing RabbitMQ connection", err);
          else logger.warn("RabbitMQ connection closed");
        });
      };

      process.on("SIGTERM", () => closeConnection("SIGTERM"));
      process.on("SIGINT", () => closeConnection("SIGINT"));
    });
  });

export const broker = await connectAMQP();

export const sendMessage = <K extends (typeof topics)[number]>(
  queue: K,
  message: z.infer<(typeof schemas)[K]>
) => {
  const buffer = Buffer.from(JSON.stringify(message));
  logger.trace(`Sending ${buffer.length} bytes to ${queue}`);
  broker.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
};
