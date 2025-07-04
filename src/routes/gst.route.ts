import express from 'express';
import { gstVerification } from '../controllers/gst.controller';

const router = express.Router();

router.post('/gst/verify', gstVerification);

export default router; 