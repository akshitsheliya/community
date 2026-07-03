import express from 'express';
import { createDonor, getAllMembers, createDonorFromMember, getAllDonors, deleteDonor, updateDonor } from '../controllers/donorsController';
import { verifyToken } from '../middleware/authMiddleware';
import {uploadDonorPhoto} from '../middleware/multerMiddleware';
import { checkCommunityAccess } from '../middleware/checkCommunityAccess';

const router = express.Router();

// Route to add a new donor
router.post('/donors', verifyToken, uploadDonorPhoto, createDonor);

// Route to get all members
router.get('/members', verifyToken, getAllMembers);

// Route to add a new donor from member list using member_id as req.params
router.post('/donors/:member_uuid', verifyToken, createDonorFromMember);

// Route to get all donors
router.get('/donors', verifyToken, getAllDonors);

// Route to delete donor
router.delete('/donors/:donor_id', verifyToken, deleteDonor);

// Route to update donor
router.put('/donors/:donor_id', verifyToken, uploadDonorPhoto, updateDonor);

export default router;
