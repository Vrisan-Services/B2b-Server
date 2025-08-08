import { Router } from 'express';
import { subscribeToFreePlan, subscribeToPlan } from '../controllers/crm-subscription.controller';

const router = Router();

router.post('/:plan', subscribeToPlan);
// router.post('/assign-free-plan', subscribeToFreePlan);

export default router; 