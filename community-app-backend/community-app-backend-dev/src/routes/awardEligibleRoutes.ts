import express from "express";
import { AwardEligibleController } from "../controllers/awardEligibleController"; // Import the class
import { verifyToken } from "../middleware/authMiddleware";
import { checkCommunityAccess } from "../middleware/checkCommunityAccess"; // Import the middleware

const router = express.Router();

router.get("/award-eligible", verifyToken, AwardEligibleController.getAllStudents);

router.get("/generate-pdf", verifyToken, AwardEligibleController.generateTop5Pdf);

export default router;