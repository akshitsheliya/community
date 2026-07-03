import express from "express";
import { getCounts } from "../controllers/countController"; 
import { verifyToken } from "../middleware/authMiddleware";
import { checkCommunityAccess } from "../middleware/checkCommunityAccess";

const router = express.Router();

router.get("/counts", verifyToken, getCounts); 

export default router;
