import Transport from "winston-transport";
import fs from "fs";
import path from "path";

export interface UserFileTransportOptions extends Transport.TransportStreamOptions {
  logRootPath: string;
}

export class UserFileTransport extends Transport {
  private logRootPath: string;

  constructor(opts: UserFileTransportOptions) {
    super(opts);
    this.logRootPath = opts.logRootPath;
    console.log(`[UserFileTransport] Initialized with logRootPath: ${this.logRootPath}`);
  }

  log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    // Debug: Log entire info object
    console.log(`[UserFileTransport] Raw info object:`, JSON.stringify(info, null, 2));

    const { level, message, user_id: topLevelUserId, timestamp, ...meta } = info;
    let user_id = topLevelUserId || (meta.metadata && meta.metadata.user_id);
    let phone_number = meta.phone_number || meta.metadata?.phone_number || "unknown";
    const url = meta.metadata?.url || "";
    const payload = meta;

    // Validate phone_number to avoid invalid folder names
    if (phone_number && !/^[a-zA-Z0-9+_-]+$/.test(phone_number)) {
      console.log(`[UserFileTransport] Invalid phone_number: ${phone_number}, using 'unknown'`);
      phone_number = "unknown";
    }

    // Infer api_name from url or message
    let api_name = "unknown";
    if (url) {
      const urlParts = url.split("/");
      api_name = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2] || "unknown";
    } else if (message) {
      const match = message.match(/Attempting to (add|update|delete|fetch) (.*)/i);
      if (match) {
        api_name = match[1].toLowerCase() + match[2].replace(/\s+/g, "");
      }
    }

    console.log(`[UserFileTransport] Processed log:`, {
      level,
      message,
      user_id,
      topLevelUserId,
      metadataUserId: meta.metadata?.user_id,
      phone_number,
      api_name,
      payload,
      metadata: meta.metadata,
    });

    const now = new Date();
    const monthName = now.toLocaleString("default", { month: "long" });
    const year = now.getFullYear();

    // Determine log directory based on user_id or phone_number
    let logDir;
    if (user_id && /^[0-9]+$/.test(String(user_id))) {
      console.log(`[UserFileTransport] Valid user_id: ${user_id}`);
      logDir = path.join(this.logRootPath, `${monthName}-${year}`, String(user_id));
    } else {
      console.log(`[UserFileTransport] No valid user_id, using phone_number: ${phone_number}`);
      logDir = path.join(this.logRootPath, `${monthName}-${year}`, "phone_number", String(phone_number));
    }

    try {
      console.log(`[UserFileTransport] Attempting to create directory: ${logDir}`);
      fs.mkdirSync(logDir, { recursive: true });

      // Use a single file per day: 2025-04-23.log
      const dateStr = now.toISOString().split("T")[0]; // 2025-04-23
      const logFilePath = path.join(logDir, `${dateStr}.log`);

      console.log(`[UserFileTransport] Writing to: ${logFilePath}`);

      // Include api_name and payload in the log line
      const logLine = `${timestamp || now.toISOString()} [${level.toUpperCase()}] ${message} ` +
        `API: ${api_name} ` +
        `Payload: ${JSON.stringify(payload)} ` +
        `${Object.keys(meta).length ? JSON.stringify(meta) : ""}\n`;

      fs.appendFileSync(logFilePath, logLine);
      console.log(`[UserFileTransport] Log written successfully`);
    } catch (error) {
      console.error(
        `[UserFileTransport] Failed to write log for ${user_id || phone_number}:`,
        error
      );
    }

    callback();
  }
}