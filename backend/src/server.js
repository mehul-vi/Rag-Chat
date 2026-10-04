const app = require("./app");
const { connectDB } = require("./config/db");
const { createCollection } = require("./services/vector.service");

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
