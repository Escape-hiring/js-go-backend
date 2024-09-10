import express from "express";
import { logger } from "./helpers/logger";
import { usersRouter } from "./routes/users";
import { z } from "zod";
import { AuthenticationError, ValidationError } from "./helpers/errors";

export const server = express();

server.use(express.json());

// Log incoming requests
server.use((req, _res, next) => {
  logger.log(`${req.method} ${req.url}`);
  next();
});

// Users routes, see routes/users.ts
server.use("/users", usersRouter);

// 404 handler
server.all("*", (_req, res) => {
  res.status(404).send({ message: "Not found" });
});

// Error handler
server.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): ReturnType<typeof next> => {
    logger.error(error);

    // Map Authentication errors onto 401 responses
    if (error instanceof AuthenticationError) {
      res.status(401).json({
        errors: [error.message],
      });
      return next();
    }

    // Map custom Validation errors onto 400 responses
    if (error instanceof ValidationError) {
      res.status(400).json({
        errors: [
          {
            message: error.message,
          },
        ],
      });
      return next();
    }

    // Map zod errors onto 400 responses
    if (error instanceof z.ZodError) {
      res.status(400).json({
        errors: error.errors.map((error) => ({
          path: error.path.join("."),
          message: error.message,
        })),
      });
      return next();
    }

    // Map Prisma unique constraint failed errors onto 409 responses
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint failed")
    ) {
      res.status(409).json({
        errors: ["Unique constraint failed"],
      });
      return next();
    }

    // Map everything else onto 500 responses
    res.status(500).json({
      errors: ["Internal server error"],
    });
    return next();
  }
);

// Log outgoing responses
server.use((req, res) => {
  logger.log(`${req.method} ${req.url} ${res.statusCode}`);
});
