import { Router } from 'express';
import { handleSubscription, handleUpdateSubscription } from '../controllers/subscription.controller';

const router = Router();

router.post('/:plan', handleSubscription);
router.put('/update-plan/:plan', handleUpdateSubscription);

export default router;