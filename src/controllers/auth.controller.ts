import { Request, Response } from 'express';
import { signup as authSignup, login as authLogin } from '../services/auth.service';
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