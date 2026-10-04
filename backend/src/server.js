const app = require("./app");
const { port } = require("./config/env");
const { connectDB } = require("./config/db");
const { createCollection } = require("./services/vector.service");

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
