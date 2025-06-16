import { Request, Response } from 'express';
import { 
  signup as authSignup, 
  login as authLogin, 
  verifyEmail, 
  verifyLoginOTP as verifyLoginOTPService,
  forgotPassword as authForgotPassword,
  resetPassword as authResetPassword,
  resendOTP as authResendOTP
} from '../services/auth.service';
import { UserSignupData, UserLoginData, AuthResponse } from '../types';

export const signup = async (req: Request<{}, {}, UserSignupData>, res: Response<AuthResponse>) => {
  try {
    const result = await authSignup(req.body);
    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

export const verifyEmailOTP = async (req: Request<{}, {}, { email: string; otp: string }>, res: Response<AuthResponse>) => {
  try {
    const result = await verifyEmail(req.body.email, req.body.otp);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

export const login = async (req: Request<{}, {}, UserLoginData>, res: Response<AuthResponse>) => {
  try {
    const result = await authLogin(req.body);
    return res.status(result.success ? 200 : 401).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

export const verifyLoginOTP = async (req: Request<{}, {}, { email: string; otp: string }>, res: Response<AuthResponse>) => {
  try {
    const result = await verifyLoginOTPService(req.body.email, req.body.otp);
    return res.status(result.success ? 200 : 401).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

export const forgotPassword = async (req: Request<{}, {}, { email: string }>, res: Response<AuthResponse>) => {
  try {
    const result = await authForgotPassword(req.body.email);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

export const resetPassword = async (req: Request<{}, {}, { email: string; otp: string; newPassword: string }>, res: Response<AuthResponse>) => {
  try {
    const result = await authResetPassword(req.body.email, req.body.otp, req.body.newPassword);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

export const resendOTP = async (req: Request<{}, {}, { email: string; type: 'signup' | 'login' | 'forgot-password' }>, res: Response<AuthResponse>) => {
  try {
    const result = await authResendOTP(req.body.email, req.body.type);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}; 