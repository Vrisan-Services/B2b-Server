import express from 'express';
import { createPaymentLink, verifyPayment } from '../controllers/payment.controller';

const router = express.Router();

router.post('/create-payment-link', createPaymentLink);
router.post('/verify-payment', verifyPayment);

export default router; 