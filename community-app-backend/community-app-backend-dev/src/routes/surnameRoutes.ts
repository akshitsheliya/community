import express from "express";
import { getSurnames } from "../controllers/surnameController";
import { verifyToken } from "../middleware/authMiddleware";
import { checkCommunityAccess } from "../middleware/checkCommunityAccess";

const router = express.Router();

router.get("/surname", verifyToken, getSurnames);


export default router;