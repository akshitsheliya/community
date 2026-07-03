import express from "express";
import { submitToken, notifyUser } from "../controllers/notificationController";
import { verifyToken } from "../../middleware/authMiddleware"; // if needed

const router = express.Router();

// Route to update the token in DB.
router.post("/submit-token", verifyToken, submitToken);
// Route to send notifications to one or more users.
router.post("/notification", verifyToken, notifyUser);

export default router;
