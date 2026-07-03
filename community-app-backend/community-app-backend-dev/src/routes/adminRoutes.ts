import express from "express";
import { assignCommunityAdmin } from "../controllers/adminController";
import { verifyToken, authenticateAdmin } from "../middleware/authMiddleware";
import { adminCheck } from "../controllers/marksheetController";
const router = express.Router();

router.post("/community-admin/assign", verifyToken, authenticateAdmin, assignCommunityAdmin);

// Admin Check API
router.get("/admin-data", verifyToken, authenticateAdmin, adminCheck);
export default router;
