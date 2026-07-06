import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string, {
      dbName: "CraveNow",
    });
    console.log("Successfully connected to MongoDB✅");
  } catch (error) {
    console.log("Failed to connect to MongoDB❌");
  }
};
