import { env } from "./config/env.js";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";

const PORT = env.PORT;

await connectDB();
await connectRedis();

app.listen(PORT, () => {
  console.log(`Sever running on http://localhost:${PORT}`);
});
