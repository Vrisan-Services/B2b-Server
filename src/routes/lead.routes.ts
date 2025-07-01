import { Router } from 'express';
import { createLeadHandler, getLeadsByUserIdHandler, updateLeadHandler } from '../controllers/lead.controller';

const router = Router();

router.post('/', createLeadHandler);
router.get('/:userId', getLeadsByUserIdHandler);
router.patch('/:id', updateLeadHandler);

export default router; 