const app = require("../src/app");
const { connectDB } = require("../src/config/db");

let dbPromise = null;

const ensureDB = async () => {
  if (!dbPromise) {
    dbPromise = connectDB().catch((err) => {
      console.warn("DB connection warning in serverless handler:", err.message);
      dbPromise = null;
    });
  }
  return dbPromise;
};

module.exports = async (req, res) => {
  try {
    await ensureDB();
  } catch (err) {
    console.warn("Database init notice:", err.message);
  }
  return app(req, res);
};
