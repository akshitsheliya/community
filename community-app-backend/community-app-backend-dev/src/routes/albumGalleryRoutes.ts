import express from 'express';
import { createPhotoAlbum, getPhotoAlbums,deletePhotoAlbum, updatePhotoAlbum } from '../controllers/albumGalleryController';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();

// Apply the verifyToken middleware to the createPhotoAlbum route
router.post('/albums', verifyToken, createPhotoAlbum);
router.get('/albums', verifyToken, getPhotoAlbums);
router.delete('/albums/:album_uuid', verifyToken, deletePhotoAlbum);
router.put('/albums/:album_uuid', verifyToken, updatePhotoAlbum);

export default router;
