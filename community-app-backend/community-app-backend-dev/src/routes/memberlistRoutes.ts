import { Router } from "express";
import { getFamilyMemberDetails } from "../controllers/memberlistController";
import { verifyToken } from "../middleware/authMiddleware";
import { checkCommunityAccess } from "../middleware/checkCommunityAccess";

const router = Router();

// Route
router.get("/members-list/:family_uuid", verifyToken, getFamilyMemberDetails);  // Ensure :family_uuid is correct


export default router;
