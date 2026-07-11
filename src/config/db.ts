import mongoose from "mongoose";

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
