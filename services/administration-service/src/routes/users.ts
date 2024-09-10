import express from "express";
import { z } from "zod";
import { createUser } from "../lib/users";
import { isAuthenticatedMiddleware } from "./auth";
import { AuthenticationError } from "../helpers/errors";

export const usersRouter = express.Router();

// Get current user
usersRouter.get("/me", isAuthenticatedMiddleware, async (req, res, next) => {
  if (!req.user) return next(new AuthenticationError());

  return res.send(req.user);
});

// Create user
usersRouter.post("/", async (req, res, next) => {
  const body = req.body;

  try {
    const { email, password } = z
      .object({
        email: z.string().email(),
        password: z.string().min(8),
      })
      .parse(body);

    const user = await createUser(email, password);

    return res.status(201).send(user);
  } catch (error) {
    return next(error);
  }
});
