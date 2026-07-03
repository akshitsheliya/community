import express from "express";
import { deleteUser, deleteMemberByUUID } from "../controllers/deleteMemberController"; 
import { verifyToken } from "../middleware/authMiddleware";
import { checkCommunityAccess } from "../middleware/checkCommunityAccess";

const router = express.Router();

router.delete("/user", verifyToken, deleteUser); 
router.delete("/member/:member_uuid", verifyToken, deleteMemberByUUID); 

export default router;
