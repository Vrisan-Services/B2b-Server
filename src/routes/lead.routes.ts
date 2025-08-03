import { Router } from 'express';
import { getLeadsByUserIdHandler, updateLeadHandler, getDashboardStatsHandler, getMonthlyBudgetDataHandler, getCustomerGrowthDataHandler, getCitywiseProjectsDataHandler, fetchLeadsFromAPIHandler, fetchFreeLeadsFromAPIHandler } from '../controllers/lead.controller';
import { validateCRMSubscription } from '../middleware/crm-subscription.middleware';

const router = Router();

// Apply CRM subscription validation to lead management routes
router.post('/fetch-from-api', validateCRMSubscription, fetchLeadsFromAPIHandler);
router.post('/fetch-free-from-api',  fetchFreeLeadsFromAPIHandler);
router.get('/:userId', validateCRMSubscription, getLeadsByUserIdHandler);
router.patch('/:id', validateCRMSubscription, updateLeadHandler);

// Dashboard routes - no CRM subscription required (data will be blurred on frontend if no subscription)
router.get('/dashboard/:userId', getDashboardStatsHandler);
router.get('/monthly-budget/:userId', getMonthlyBudgetDataHandler);
router.get('/customer-growth/:userId', getCustomerGrowthDataHandler);
router.get('/citywise-projects/:userId', getCitywiseProjectsDataHandler);

export default router; 