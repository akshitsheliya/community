import express from "express";
import { getAllMembers, getMemberByUuid, addMember, updateMember, deleteMember } from "../controllers/abroadMemberController";
import { verifyToken } from "../middleware/authMiddleware";
import { uploadPassportPhoto } from "../middleware/multerMiddleware";
import { checkCommunityAccess } from "../middleware/checkCommunityAccess";

const router = express.Router();

router.get("/abroad", verifyToken, getAllMembers);
router.get("/abroad/:abroad_uuid", verifyToken, getMemberByUuid);
router.post("/abroad", verifyToken, uploadPassportPhoto, addMember);
router.put("/abroad/:abroad_uuid", verifyToken, uploadPassportPhoto, updateMember);
router.delete("/abroad/:abroad_uuid", verifyToken, deleteMember);

export default router;