import { createPool } from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const dbPool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
