import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

/** Instantiated Prisma client. */
export const prisma = new PrismaClient();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  logger.warn("Disconnected Prisma client.");
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  logger.warn("Disconnected Prisma client.");
});
