import express from 'express';
import { updateAppLanguage } from '../controllers/appLanguageController';
import { verifyToken } from '../middleware/authMiddleware';
import { checkCommunityAccess } from '../middleware/checkCommunityAccess';

const router = express.Router();

router.put('/language', verifyToken, updateAppLanguage);

export default router;
