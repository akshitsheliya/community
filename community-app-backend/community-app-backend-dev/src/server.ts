import dotenv from "dotenv";
dotenv.config();
export const PORT = process.env.PORT || 3000;
export const SWAGGER_HOST = process.env.SWAGGER_HOST || "http://localhost:3000";

import app from "./app";
import { dbPool } from "./config/db";
import { setupSwagger } from "./swagger/swagger"; // Updated import path

async function startServer() {
  try {
    // Test database connection
    const connection = await dbPool.getConnection();
    console.log("Database connected successfully");
    connection.release();

    // Initialize Swagger
    setupSwagger(app);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
