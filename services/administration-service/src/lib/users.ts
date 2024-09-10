import crypto from "node:crypto";
import { prisma } from "../helpers/prisma";
import { logger } from "../helpers/logger";
import type { User } from "@prisma/client";
import { login } from "./auth";
import { sendMessage } from "../helpers/kafka";

export const createUser = async (
  email: string,
  password: string
): Promise<{
  user: Omit<User, "password" | "salt">;
  jwt: string;
}> => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");

  logger.log(`Creating user with email ${email}`);
  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      salt,
    },
    select: {
      createdAt: true,
      email: true,
      id: true,
      updatedAt: true,
    },
  });
  logger.log(`Created user with email ${email}`);

  await sendMessage("users.created", user);
  return { user, ...(await login(user.email, password)) };
};
