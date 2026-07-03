import express, { Router, Request, Response } from "express";
import path from "path";
import serveIndex from "serve-index";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const router = Router();

// Server status route
router.get("/status", (req: Request, res: Response) => {
  res.json({ message: "Server is running", status: "ok" });
});

// Use LOG_PATH from environment
const logsdir = process.env.LOG_PATH ;

if (!logsdir) {
  console.error("LOG_PATH environment variable is not set.");
  process.exit(1);
}

router.use(
  "/logs",
  express.static(logsdir),
  serveIndex(logsdir, { icons: true })
);

export default router;
