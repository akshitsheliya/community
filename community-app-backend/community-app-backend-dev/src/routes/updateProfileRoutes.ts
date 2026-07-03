import { Router } from "express";
import { getLoggedInUserData, updateLoggedInUserData } from "../controllers/updateProfileController";
import { verifyToken } from "../middleware/authMiddleware";
import { uploadProfileFiles } from "../middleware/multerMiddleware"; // Import Multer middleware
import { checkCommunityAccess } from "../middleware/checkCommunityAccess";

const router = Router();

// Protected route - Get logged-in user's data
router.get("/user", verifyToken, getLoggedInUserData as any);

// Protected route - Update logged-in user's data with file upload
router.put("/user/:member_uuid", verifyToken, uploadProfileFiles, updateLoggedInUserData as any);

export default router;
