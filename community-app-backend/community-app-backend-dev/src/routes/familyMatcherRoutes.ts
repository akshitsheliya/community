import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import * as controller from '../controllers/familyMatcherController';

const router = Router();

router.use(verifyToken);

// Trigger scan (admin only)
router.post('/scan', controller.triggerScan);

// Get suggestions with filters
router.get('/suggestions', controller.getSuggestions);

// Get stats
router.get('/stats', controller.getStats);

// Approve/reject suggestion
router.put('/suggestion/:suggestionUuid/approve', controller.approveSuggestion);
router.put('/suggestion/:suggestionUuid/reject', controller.rejectSuggestion);

export default router;
