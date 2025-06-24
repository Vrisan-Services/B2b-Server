import express from 'express';
import { gstVerification } from '../controllers/gst.controller';
import { gstRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.post('/gst/verify', gstRateLimiter, gstVerification);

export default router; 