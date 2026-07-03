// Update your route definition
import express from "express";
import { storeAdditionalMemberData } from "../controllers/familyMemberController";
import { verifyToken } from "../middleware/authMiddleware";
import { uploadProfileFiles } from '../middleware/multerMiddleware';
import { checkCommunityAccess } from "../middleware/checkCommunityAccess";

const router = express.Router();

// Use type assertion to tell TypeScript this is compatible
router.post(
  "/members", 
  verifyToken, 
  uploadProfileFiles, 
  storeAdditionalMemberData as express.RequestHandler
);

export default router;