import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  signup, 
  login, 
  verifyEmailOTP, 
  verifyLoginOTP,
  forgotPassword,
  resetPassword,
  resendOTP
} from './controllers/auth.controller';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/auth/signup', signup);
app.post('/api/auth/verify-email', verifyEmailOTP);
app.post('/api/auth/login', login);
app.post('/api/auth/verify-login', verifyLoginOTP);
app.post('/api/auth/forgot-password', forgotPassword);
app.post('/api/auth/reset-password', resetPassword);
app.post('/api/auth/resend-otp', resendOTP);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 