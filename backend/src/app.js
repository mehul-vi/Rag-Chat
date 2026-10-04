const express = require("express");
const cors = require("cors");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const { clientUrl, isProduction } = require("./config/env");

const pdfRoutes = require("./routes/pdf.routes");
const chatRoutes = require("./routes/chat.routes");
const historyRoutes = require("./routes/history.routes");

const app = express();

app.set("trust proxy", 1); // needed behind Render's proxy for rate limiting

const origins = clientUrl.split(",").map((o) => o.trim().replace(/\/$/, ""));
app.use(cors({ origin: origins }));
app.use(express.json({ limit: "500kb" }));

const limiter = (max) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." },
  });

app.use("/api/pdf", limiter(30), pdfRoutes);
app.use("/api/chat", limiter(200), chatRoutes);
app.use("/api/history", limiter(400), historyRoutes);

app.get("/", (req, res) => res.json({ message: "PDF RAG Chat API is running" }));
app.get("/health", (req, res) => res.json({ success: true, status: "ok" }));

// Central error handler.
app.use((error, req, res, next) => {
  const status = error instanceof multer.MulterError ? 400 : error.status || 500;
  const isServerError = status >= 500;

  if (isServerError) console.error("Unhandled Error:", error);

  res.status(status).json({
    success: false,
    message: isServerError ? "Something went wrong. Please try again." : error.message,
    error: isServerError && !isProduction ? error.message : undefined,
  });
});

module.exports = app;
