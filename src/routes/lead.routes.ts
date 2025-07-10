import { Router } from 'express';
import { getLeadsByUserIdHandler, updateLeadHandler, getDashboardStatsHandler, getMonthlyBudgetDataHandler, getCustomerGrowthDataHandler, getCitywiseProjectsDataHandler, fetchLeadsFromAPIHandler } from '../controllers/lead.controller';

const router = Router();

router.post('/fetch-from-api', fetchLeadsFromAPIHandler);
router.get('/:userId', getLeadsByUserIdHandler);
router.patch('/:id', updateLeadHandler);
router.get('/dashboard/:userId', getDashboardStatsHandler);
router.get('/monthly-budget/:userId', getMonthlyBudgetDataHandler);
router.get('/customer-growth/:userId', getCustomerGrowthDataHandler);
router.get('/citywise-projects/:userId', getCitywiseProjectsDataHandler);

export default router; 