import mongoose from "mongoose";

// Log connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose default connection open to DB");
});
mongoose.connection.on("error", (err) => {
  console.error("Mongoose default connection error:", err);
});
mongoose.connection.on("disconnected", () => {
  console.log("Mongoose default connection disconnected");
});

export const connectDB = async () => {
  try {
    console.log("Starting MongoDB connection attempt...");
    await mongoose.connect(process.env.MONGODB_URI as string, {
      dbName: "CraveNow",
    });
    console.log("Successfully connected to MongoDB✅");
  } catch (error) {
    console.error("Failed to connect to MongoDB❌ Error:", error);
  }
};
