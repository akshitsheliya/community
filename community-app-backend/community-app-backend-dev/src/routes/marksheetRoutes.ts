import express from "express";
import {
  processMarkSheet,
  storeMarksheet,
  getMarksheet,
  getAllMarksheets,
  approveMarksheet,
  rejectMarksheet,
  editMarksheet,
  deleteMarksheet,
} from "../controllers/marksheetController";
import { verifyToken, authenticateAdmin } from "../middleware/authMiddleware";
import { uploadMarksheet } from "../middleware/multerMiddleware";
import { checkCommunityAccess } from "../middleware/checkCommunityAccess";

const router = express.Router();

// Process Marksheet (Upload + OCR Extraction)
router.post("/process-marksheet", verifyToken, uploadMarksheet, processMarkSheet);

// Store Extracted & User-Confirmed Marksheet Data
router.post("/marksheets", verifyToken, storeMarksheet);

// Get Marksheet (User-Specific)
router.get("/marksheets", verifyToken, getMarksheet);

// Get All Marksheets (Admin Only)
router.get("/all-marksheets", verifyToken, authenticateAdmin, getAllMarksheets);

// Approve Marksheet
router.put("/marksheets/approve/:id", verifyToken, authenticateAdmin, approveMarksheet);

// Reject Marksheet
router.put("/marksheets/reject/:marksheet_uuid", verifyToken, authenticateAdmin, rejectMarksheet);

// Edit Marksheet (Admin Only)
router.put("/marksheets/edit/:id", verifyToken, authenticateAdmin, editMarksheet);

// Delete Marksheet (User-Specific)
router.delete("/marksheets/:id", verifyToken, deleteMarksheet);


export default router;