import express from "express";
import { getFamilyRepresentatives } from "../controllers/familyRepresentativeController";
import { verifyToken } from "../middleware/authMiddleware";
import { checkCommunityAccess } from "../middleware/checkCommunityAccess";

const router = express.Router();

router.get("/representatives", verifyToken, getFamilyRepresentatives);

export default router;
