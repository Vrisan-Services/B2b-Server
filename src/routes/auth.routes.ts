import { Router } from 'express';
import { 
    signup, 
    login, 
    verifyEmailOTP, 
    verifyLoginOTP,
    forgotPassword,
    resetPassword,
    resendOTP
} from '../controllers/auth.controller';

const router = Router();

// Authentication routes
router.post('/signup', signup);
router.post('/verify-email', verifyEmailOTP);
router.post('/login', login);
router.post('/verify-login', verifyLoginOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOTP);

export default router; 