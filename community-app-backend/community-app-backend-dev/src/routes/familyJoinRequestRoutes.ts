import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import * as controller from '../controllers/familyJoinRequestController';

const router = Router();

router.use(verifyToken);

// Search matching families for the logged-in user
router.get('/search', controller.searchMatchingFamilies);

// Create a new join request
router.post('/request', controller.createRequest);

// Get requests
router.get('/incoming', controller.getIncomingRequests);         // Requests TO my family
router.get('/my-requests', controller.getMyRequests);            // Requests FROM me
router.get('/community', controller.getCommunityRequests);       // Admin view

// Stats
router.get('/stats', controller.getStats);

// Actions
router.put('/request/:requestUuid/approve', controller.approveRequest);
router.put('/request/:requestUuid/reject', controller.rejectRequest);
router.put('/request/:requestUuid/cancel', controller.cancelRequest);

export default router;
