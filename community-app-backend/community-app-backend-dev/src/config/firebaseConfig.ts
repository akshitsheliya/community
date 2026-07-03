import admin from "firebase-admin";
import path from "path";
import fs from "fs";

// Ensure the base directory always points to `src/config`
const baseDir = path.join(process.cwd(), "src", "config");
const serviceAccountPath = path.join(baseDir, "firebase-service-account.json");

// Debugging logs
// console.log("🔥 Firebase base directory:", baseDir);
// console.log("🔍 Looking for Firebase service account at:", serviceAccountPath);

// Check if the file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ Firebase service account file not found at:", serviceAccountPath);
  process.exit(1); // Stop execution
}

// Load service account file
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
