import { Router } from "express";
import { getNewsFeeds, getNewsByUuid, createNews, deleteNewsByUuid ,updateNews } from "../controllers/newsController";
import { verifyToken } from "../middleware/authMiddleware"; // Import the middleware
import { uploadNewsImage } from "../middleware/multerMiddleware"; // Import the middleware
import { checkCommunityAccess } from "../middleware/checkCommunityAccess";

const router = Router();

router.get("/news", verifyToken, getNewsFeeds); // Get all news (Public - no auth)
router.get("/news/:newsUuid", verifyToken, getNewsByUuid); // Get specific news by UUID (Public - no auth)

// Protected routes - require authentication
router.post("/news", verifyToken, uploadNewsImage, createNews); // Create new news (Admin - auth required)
router.delete("/news/:newsUuid", verifyToken, deleteNewsByUuid); // Delete news by UUID

router.put("/news/:newsUuid", verifyToken, uploadNewsImage, updateNews);
export default router;
