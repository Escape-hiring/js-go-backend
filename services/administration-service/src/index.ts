import { logger } from "./helpers/logger";
import { server } from "./server";

const port = process.env["PORT"] || 2602;

const handle = server.listen(port, () => {
  logger.log(`Administration service listening on port ${port}`);
});

process.on("SIGINT", async () => {
  logger.warn("Caught SIGINT signal, stopping http server.");
  handle.close(() => logger.warn("Administration service stopped."));
});

process.on("SIGTERM", async () => {
  logger.warn("Caught SIGTERM signal, stopping http server.");
  handle.close(() => logger.warn("Administration service stopped."));
});
