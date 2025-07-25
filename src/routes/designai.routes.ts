import express from 'express';
import { getDesignHistory, createDesign, generateDesign, initializeDesign, subscribeDesignAiPlan } from '../controllers/designai.controller';

const router = express.Router();

// GET: Fetch design history for a user
router.get('/history', getDesignHistory);

// POST: Create a new design entry
router.post('/create', createDesign);

// POST: Generate a design (AI + image upload)
router.post('/generate', generateDesign);

// POST: Initialize a design
router.post('/initialize-design', initializeDesign);

// POST: Generate a design (new flow)
router.post('/generate-design', generateDesign);

// POST: Subscribe to a design AI plan and add credits
router.post('/subscribe', subscribeDesignAiPlan);

export default router; 