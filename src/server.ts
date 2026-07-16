import { env } from "./config/env.js";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { logger } from "./config/logger.js";
import { createServer } from "http";
import { initializeSocket } from "./socket/socket.js";

const PORT = env.PORT;

await connectDB();
await connectRedis();

const server = createServer(app);
initializeSocket(server);

server.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
