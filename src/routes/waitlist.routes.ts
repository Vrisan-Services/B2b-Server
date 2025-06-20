import { Router } from 'express';
import { submitWaitlist } from '../controllers/waitlist.controller';

const router = Router();

router.post('/', submitWaitlist);

export default router; 