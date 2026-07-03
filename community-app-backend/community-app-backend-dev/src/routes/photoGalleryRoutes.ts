// Photo upload routes (photoGalleryRoutes.js)
import { Router } from "express";
import { uploadPhoto, getPhotosByAlbum } from "../controllers/photoGalleryController";
import { verifyToken } from "../middleware/authMiddleware";
import { handleGalleryUpload } from "../middleware/multerMiddleware";

const router = Router();

// POST /api/albums/:album_uuid/photos - Upload a photo to a specific album
router.post(
  "/photos/:album_uuid",
  verifyToken, // Ensure the user is authenticated
  handleGalleryUpload, // Use the new async-capable middleware
  uploadPhoto // Call the controller function after file is processed
);

// Photo Gallery Routes
router.get(
  "/photos/:album_uuid",
  verifyToken,
  getPhotosByAlbum
);

export default router;