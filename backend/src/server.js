require("dotenv").config();
const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes");
const { initCollection } = require("./models/vector.model");
const { port, maxUploadMb } = require("./config/env");
const errorHandler = require("./middleware/error.middleware");

const app = express();
app.disable("x-powered-by");
const allowedOrigins = process.env.CORS_ORIGIN || process.env.CLIENT_URL;
app.use(cors({ origin: allowedOrigins ? allowedOrigins.split(",").map((value) => value.trim()) : true }));
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => res.json({
  success: true,
  message: "PDF Chat API is running",
  endpoints: { health: "GET /api/health", upload: "POST /api/pdf/upload", chat: "POST /api/chat" },
}));
app.get(["/health", "/api/health"], (req, res) => res.json({ success: true, status: "ok", maxUploadMb }));
app.use("/api", apiRoutes);
app.use((req, res) => res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` }));
app.use(errorHandler);

// Lazy collection initialization for serverless / local
let collectionPromise = null;
app.use((req, res, next) => {
  if (!collectionPromise) {
    collectionPromise = initCollection().catch((err) => {
      console.warn("[Qdrant] Collection init notice:", err.message);
      collectionPromise = null;
    });
  }
  next();
});

async function startServer() {
  try {
    await initCollection();
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
