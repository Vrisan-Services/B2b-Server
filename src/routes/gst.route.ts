import express from 'express';
import { gstVerification } from '../controllers/gst.controller';

const router = express.Router();

router.post('/verify', gstVerification);

export default router; 