// ==============================================================================
// 1. Polyfill Canvas / Web Globals for Serverless (pdf-parse compatibility)
// ==============================================================================
if (typeof globalThis.DOMMatrix === "undefined") {
  globalThis.DOMMatrix = class DOMMatrix {
    constructor(init) {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
      this.m11 = 1; this.m12 = 0; this.m13 = 0; this.m14 = 0;
      this.m21 = 0; this.m22 = 1; this.m23 = 0; this.m24 = 0;
      this.m31 = 0; this.m32 = 0; this.m33 = 1; this.m34 = 0;
      this.m41 = 0; this.m42 = 0; this.m43 = 0; this.m44 = 1;
      this.is2D = true;
      this.isIdentity = true;
      if (Array.isArray(init)) {
        this.a = init[0] ?? 1;
        this.b = init[1] ?? 0;
        this.c = init[2] ?? 0;
        this.d = init[3] ?? 1;
        this.e = init[4] ?? 0;
        this.f = init[5] ?? 0;
      }
    }
    translate() { return this; }
    scale() { return this; }
    transformPoint(point) { return point; }
    multiply() { return this; }
    invertSelf() { return this; }
    multiplySelf() { return this; }
    preMultiplySelf() { return this; }
    static fromMatrix(m) { return new DOMMatrix(m); }
  };
}

if (typeof globalThis.ImageData === "undefined") {
  globalThis.ImageData = class ImageData {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.data = new Uint8ClampedArray(width * height * 4);
    }
  };
}

if (typeof globalThis.Path2D === "undefined") {
  globalThis.Path2D = class Path2D {
    constructor() {}
    addPath() {}
    closePath() {}
    moveTo() {}
    lineTo() {}
    bezierCurveTo() {}
    quadraticCurveTo() {}
    arc() {}
    arcTo() {}
    ellipse() {}
    rect() {}
  };
}

// ==============================================================================
// 2. Dependencies & Environment
// ==============================================================================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const rateLimit = require("express-rate-limit");

const { connectDB } = require("./src/config/db");
const { createCollection } = require("./src/services/vector.service");
const { uploadPDF } = require("./src/controllers/pdf.controller");
const { chat } = require("./src/controllers/chat.controller");
const {
  getHistory,
  getSession,
  createSession,
  updateSession,
  deleteSession,
} = require("./src/controllers/history.controller");
const httpError = (status, message) => Object.assign(new Error(message), { status });

// ==============================================================================
// 3. App Setup & Core Middlewares
// ==============================================================================
const app = express();
app.set("trust proxy", 1);

// Immediate Root & Health Endpoints (Instant response, no DB/proxy lag)
app.get("/", (req, res) => res.send("Hello World"));
app.get(["/health", "/api/health"], (req, res) => res.json({ success: true, status: "ok" }));
app.get("/api", (req, res) => res.json({ message: "PDF RAG Chat API is running" }));

// Lazy DB Connection Warming for Serverless
let dbPromise = null;
app.use((req, res, next) => {
  if (!dbPromise) {
    dbPromise = connectDB().catch((err) => {
      console.warn("DB connection notice:", err.message);
      dbPromise = null;
    });
  }
  next();
});

// CORS Configuration
const clientUrl = process.env.CLIENT_URL || "*";
const origins = clientUrl.split(",").map((o) => o.trim().replace(/\/$/, ""));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed =
        origins.includes(origin) ||
        origins.includes("*") ||
        /\.vercel\.app$/.test(origin) ||
        origin.includes("localhost");
      if (isAllowed) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "500kb" }));

// File Upload (Multer - in-memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") return cb(null, true);
    cb(httpError(400, "Only PDF files are allowed"));
  },
});

// Rate Limiting Helper
const limiter = (max) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." },
  });

// ==============================================================================
// 4. API Routes (All integrated directly into server.js)
// ==============================================================================

// PDF Upload
app.post("/api/pdf/upload", limiter(30), upload.single("pdf"), uploadPDF);

// RAG Chat
app.post("/api/chat", limiter(200), chat);

// Chat History Sessions
app.get("/api/history", limiter(400), getHistory);
app.get("/api/history/:id", getSession);
app.post("/api/history", createSession);
app.put("/api/history/:id", updateSession);
app.delete("/api/history/:id", deleteSession);

// Central Error Handler
app.use((error, req, res, next) => {
  const status = error instanceof multer.MulterError ? 400 : error.status || 500;
  const isServerError = status >= 500;
  const isProduction = process.env.NODE_ENV === "production";

  if (isServerError) console.error("Unhandled Error:", error);

  res.status(status).json({
    success: false,
    message: isServerError ? "Something went wrong. Please try again." : error.message,
    error: isServerError && !isProduction ? error.message : undefined,
  });
});

// ==============================================================================
// 5. Server Startup (Local & Serverless exports)
// ==============================================================================
const port = Number(process.env.PORT) || 5000;

const start = async () => {
  try {
    await connectDB();
    await createCollection();
    if (!process.env.VERCEL) {
      app.listen(port, () => console.log(`Server running on port ${port}`));
    }
  } catch (error) {
    console.error("Server Startup Error:", error.message);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

if (!process.env.VERCEL && require.main === module) {
  start();
}

module.exports = app;
