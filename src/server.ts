import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";

const PORT = process.env.PORT as string;

await connectDB();
await connectRedis();

app.listen(PORT, () => {
  console.log(`Sever running on http://localhost:${PORT}`);
});
