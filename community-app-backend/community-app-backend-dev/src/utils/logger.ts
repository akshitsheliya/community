import winston from "winston";
import { UserFileTransport } from "./UserFileTransport";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new UserFileTransport({
      logRootPath: process.env.LOG_PATH || "./logs",
    }),
  ],
});

export default logger;