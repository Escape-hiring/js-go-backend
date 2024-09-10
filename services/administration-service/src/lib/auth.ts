import { AuthenticationError, ValidationError } from "../helpers/errors";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../helpers/prisma";
import type { User } from "@prisma/client";
import type { Request } from "express";

const JWT_SECRET = process.env["JWT_SECRET"];

if (JWT_SECRET === undefined) {
  throw new Error("JWT_SECRET is not defined");
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const login = async (
  email: string,
  password: string
): Promise<{ jwt: string }> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user === null) {
    throw new ValidationError("Invalid email or password");
  }

  const hash = crypto
    .pbkdf2Sync(password, user.salt, 1000, 64, "sha512")
    .toString("hex");

  if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(user.password))) {
    throw new ValidationError("Invalid email or password");
  }

  return {
    jwt: jwt.sign(
      { expires_at: Math.floor(Date.now() / 1000) + 60 * 60, id: user.id },
      JWT_SECRET
    ),
  };
};

export const authenticate = async (
  bearer: string
): Promise<Omit<User, "password" | "salt">> => {
  const decoded = jwt.verify(bearer, JWT_SECRET) as {
    expires_at: number;
    id: string;
  };

  if (decoded.expires_at < Math.floor(Date.now() / 1000)) {
    throw new AuthenticationError();
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, createdAt: true, updatedAt: true },
  });

  if (user === null) {
    throw new AuthenticationError();
  }

  return user;
};
