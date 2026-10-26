require("dotenv").config();
const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes");
const { initCollection } = require("./models/vector.model");
const { connectDB } = require("./config/db");
const { port, maxUploadMb } = require("./config/env");
const errorHandler = require("./middleware/error.middleware");

const app = express();
app.disable("x-powered-by");

// Global bulletproof CORS headers for all incoming requests (Vercel, localhost, preview URLs)
app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

// Lazy Qdrant and MongoDB initialization for serverless / local
let initPromise = null;
app.use((req, res, next) => {
  if (!initPromise) {
    initPromise = Promise.allSettled([
      initCollection().catch((err) => console.warn("[Qdrant] Collection init notice:", err.message)),
      connectDB().catch((err) => console.warn("[MongoDB] Init notice:", err.message)),
    ]);
  }
  next();
});

// Root & Health routes
app.get("/", (req, res) => res.json({
  success: true,
  message: "PDF Chat API is running",
  endpoints: { health: "GET /api/health", upload: "POST /api/pdf/upload", chat: "POST /api/chat", history: "GET /api/history?uid=" },
}));
app.get(["/health", "/api/health"], (req, res) => res.json({ success: true, status: "ok", maxUploadMb }));

// API routes
app.use("/api", apiRoutes);

// 404 Handler
app.use((req, res) => res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` }));

// Centralized error handler
app.use(errorHandler);

async function startServer() {
  try {
    await Promise.allSettled([initCollection(), connectDB()]);
    app.listen(port, () => console.log(`PDF Chat API listening at http://localhost:${port}`));
  } catch (error) {
    console.error("Could not start PDF Chat API:", error.message);
    process.exitCode = 1;
  }
}

if (!process.env.VERCEL && require.main === module) {
  startServer();
}

module.exports = app;
