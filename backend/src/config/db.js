const mongoose = require("mongoose");
const { mongodbUri } = require("./env");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  if (!mongodbUri) {
    console.warn("MONGODB_URI is not set. MongoDB chat history is disabled.");
    return;
  }

  try {
    await mongoose.connect(mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.warn("MongoDB connection notice:", error.message);
  }
};

module.exports = { connectDB, isConnected: () => isConnected };
