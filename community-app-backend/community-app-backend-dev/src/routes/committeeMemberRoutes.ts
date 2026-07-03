import express from "express";
import { getCommitteeMember,addCommitteeMember, deleteCommitteeMember, editCommitteeMember } from "../controllers/committeeMemberController";
import { verifyToken } from "../middleware/authMiddleware";
import { checkCommunityAccess } from "../middleware/checkCommunityAccess";

const router = express.Router();

router.get("/committee", verifyToken, getCommitteeMember);

router.put("/committee/:member_uuid", verifyToken, addCommitteeMember);

router.put("/edit-committee/:member_uuid", verifyToken, editCommitteeMember);

router.delete("/committee/:member_uuid", verifyToken, deleteCommitteeMember);

export default router;
