import { Router } from 'express';
import { subscribeToPlan } from '../controllers/crm-subscription.controller';

const router = Router();

router.post('/:plan', subscribeToPlan);

export default router; 