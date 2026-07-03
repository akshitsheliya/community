import express from "express";
import { getCommunity, changeCommunity } from "../controllers/communityNumberController";
import { verifyToken, authenticateAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/community", getCommunity);
router.post("/auth/change-community", verifyToken, changeCommunity as any);
export default router;
