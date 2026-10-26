const mongoose = require("mongoose");

let isConnecting = false;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("[MongoDB] MONGODB_URI is not set. Chat history will use in-memory / local storage only.");
    return null;
  }

  if (isConnecting) return null;
  isConnecting = true;

  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || "rag_chat",
    });
    console.log("[MongoDB] Connected to MongoDB database: " + (process.env.MONGODB_DB_NAME || "rag_chat"));
    return mongoose.connection;
  } catch (error) {
    console.warn("[MongoDB] Failed to connect to MongoDB:", error.message);
    return null;
  } finally {
    isConnecting = false;
  }
}

module.exports = { connectDB };
