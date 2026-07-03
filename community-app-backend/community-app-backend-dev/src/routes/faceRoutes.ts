import express from "express";
import {
  triggerFaceRecognition,
  uploadSelfie,
  getUserSelfies,
  getSelfiePhotos,
  deleteSelfie,
  processNextSelfie
} from "../controllers/faceController";
import { verifyToken, authenticateAdmin } from "../middleware/authMiddleware";
import { uploadSelfies } from "../middleware/multerMiddleware";

const router = express.Router();

// Admin route for face recognition
router.post("/face-recognition/album/:album_uuid", verifyToken, authenticateAdmin, triggerFaceRecognition);

// User routes for selfie
router.post("/selfie/upload", verifyToken, uploadSelfies, uploadSelfie);
router.get("/selfies", verifyToken, getUserSelfies);
router.get("/selfie/:selfie_uuid/album/:album_uuid", verifyToken, getSelfiePhotos);
router.delete("/selfie/:selfie_uuid", verifyToken, deleteSelfie);
router.post("/face/process-selfie", processNextSelfie);

export default router;