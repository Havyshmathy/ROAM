import "dotenv/config";
import app from "./app.js";
import prisma from "./config/database.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();

    console.log("Connected to PostgreSQL successfully.");

    app.listen(PORT, () => {
      console.log(`ROAM API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start ROAM backend:", error.message);
    process.exit(1);
  }
}

startServer();