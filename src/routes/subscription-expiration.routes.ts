import { Router } from 'express';
import { checkExpiredCRMSubscriptions, checkExpiredMainSubscriptions, checkAllExpiredSubscriptionsHandler } from '../controllers/subscription-expiration.controller';

const router = Router();

// Manual subscription expiration check endpoints
router.post('/check-crm-expired', checkExpiredCRMSubscriptions);
router.post('/check-main-expired', checkExpiredMainSubscriptions);
router.post('/check-all-expired', checkAllExpiredSubscriptionsHandler);

export default router; 