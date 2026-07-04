import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import * as familyGraphController from '../controllers/familyGraphController';

const router = Router();

// All routes require authentication
router.use(verifyToken as any);

// Add relationship
router.post('/relationship', familyGraphController.addRelationship);

// Get my relationships (logged-in user)
router.get('/me', familyGraphController.getMyRelationships);

// Get relationships for a specific member
router.get('/member/:memberUuid', familyGraphController.getMemberRelationships);

// Get family tree
router.get('/tree/:memberUuid', familyGraphController.getFamilyTree);

// Admin routes for approvals
router.get('/pending', familyGraphController.getPendingRelationships);
router.put('/relationship/:relationshipUuid/approve', familyGraphController.approveRelationship);
router.put('/relationship/:relationshipUuid/reject', familyGraphController.rejectRelationship);
router.delete('/relationship/:relationshipUuid', familyGraphController.deleteRelationship);

export default router;
