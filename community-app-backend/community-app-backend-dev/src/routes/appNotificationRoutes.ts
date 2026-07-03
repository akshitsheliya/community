import express from "express";
import {
  getAppNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/appNotificationController";
import { verifyToken } from "../middleware/authMiddleware";
import { checkCommunityAccess } from "../middleware/checkCommunityAccess";

const router = express.Router();

router.get("/notification", verifyToken, getAppNotifications);
router.put(
  "/notification/:notification_uuid",
  verifyToken,
  markNotificationAsRead
);
router.put("/notification", verifyToken, markAllNotificationsAsRead);

export default router;
