import { Router } from "express";
import { getFamilyDetails } from "../controllers/familyController";
import { verifyToken } from "../middleware/authMiddleware"; // Import the verifyToken middleware
import { checkCommunityAccess } from "../middleware/checkCommunityAccess";

const router = Router();

// Protected route - requires authentication
router.get("/families", verifyToken, getFamilyDetails);

export default router;
