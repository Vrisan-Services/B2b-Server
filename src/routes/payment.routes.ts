import express from 'express';
import { createPaymentLink } from '../controllers/payment.controller';

const router = express.Router();

router.post('/create-payment-link', createPaymentLink);

export default router; 