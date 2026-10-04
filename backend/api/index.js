const app = require("../src/app");
const { connectDB } = require("../src/config/db");

// Warm up DB connection on serverless cold starts
connectDB().catch((err) => console.warn("DB connection notice:", err.message));

module.exports = app;
