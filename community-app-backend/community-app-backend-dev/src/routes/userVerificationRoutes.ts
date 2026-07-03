import { Router } from "express";
import { getUnverifiedUsers, approveUser, rejectUser } from "../controllers/userVerificationController";
import { verifyToken, authenticateAdmin } from "../middleware/authMiddleware";
import { checkCommunityAccess } from "../middleware/checkCommunityAccess";

const router = Router();

// Pass member_id as a route parameter
router.get("/unverified", verifyToken, authenticateAdmin, getUnverifiedUsers);
router.put("/approve/:member_uuid", verifyToken, authenticateAdmin, approveUser);
router.put("/reject/:member_uuid", verifyToken, authenticateAdmin, rejectUser);

export default router;