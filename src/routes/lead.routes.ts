import { Router } from 'express';
import { createLeadHandler, getLeadsByUserIdHandler, updateLeadHandler, getDashboardStatsHandler } from '../controllers/lead.controller';

const router = Router();

router.post('/', createLeadHandler);
router.get('/:userId', getLeadsByUserIdHandler);
router.patch('/:id', updateLeadHandler);
router.get('/dashboard/:userId', getDashboardStatsHandler);

export default router; 