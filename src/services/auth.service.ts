import { auth, db } from '../config/firebase';
import { UserSignupData, UserLoginData, ApiResponse } from '../types';
import { sendVerificationEmail, sendLoginOTP } from '../config/email';

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore: { [key: string]: { otp: string; expires: number } } = {};

// Function to generate a random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const signup = async (userData: UserSignupData): Promise<ApiResponse> => {
  try {
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.contactPerson,
      emailVerified: false,
    });

    // Generate OTP
    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore[userData.email] = { otp, expires };

    // Send verification email
    const emailSent = await sendVerificationEmail(userData.email, otp);
    if (!emailSent) {
      throw new Error('Failed to send verification email');
    }

    // Store additional user data in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      orgName: userData.orgName,
      contactPerson: userData.contactPerson,
      designation: userData.designation,
      email: userData.email,
      phone: userData.phone,
      address1: userData.address1,
      address2: userData.address2,
      city: userData.city,
      state: userData.state,
      pincode: userData.pincode,
      gstNumber: userData.gstNumber,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'User registered successfully. Please verify your email with the OTP sent.',
      data: { uid: userRecord.uid }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Error during signup',
      error: error.message
    };
  }
};

export const verifyEmail = async (email: string, otp: string): Promise<ApiResponse> => {
  try {
    const storedOTP = otpStore[email];
    if (!storedOTP || storedOTP.expires < Date.now()) {
      return {
        success: false,
        message: 'OTP expired or invalid'
      };
    }

    if (storedOTP.otp !== otp) {
      return {
        success: false,
        message: 'Invalid OTP'
      };
    }

    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    
    // Update email verification status
    await auth.updateUser(userRecord.uid, { emailVerified: true });
    await db.collection('users').doc(userRecord.uid).update({ emailVerified: true });

    // Remove OTP from store
    delete otpStore[email];

    return {
      success: true,
      message: 'Email verified successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Error during email verification',
      error: error.message
    };
  }
};

export const login = async (loginData: UserLoginData): Promise<ApiResponse> => {
  try {
    const userRecord = await auth.getUserByEmail(loginData.email);
    
    if (!userRecord.emailVerified) {
      return {
        success: false,
        message: 'Please verify your email first'
      };
    }

    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    // Generate and send OTP
    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore[loginData.email] = { otp, expires };

    // Send OTP email
    const emailSent = await sendLoginOTP(loginData.email, otp);
    if (!emailSent) {
      throw new Error('Failed to send OTP');
    }

    return {
      success: true,
      message: 'OTP sent to your email',
      data: {
        uid: userRecord.uid,
        email: loginData.email
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Error during login',
      error: error.message
    };
  }
};

export const verifyLoginOTP = async (email: string, otp: string): Promise<ApiResponse> => {
  try {
    const storedOTP = otpStore[email];
    if (!storedOTP || storedOTP.expires < Date.now()) {
      return {
        success: false,
        message: 'OTP expired or invalid'
      };
    }

    if (storedOTP.otp !== otp) {
      return {
        success: false,
        message: 'Invalid OTP'
      };
    }

    // Get user data
    const userRecord = await auth.getUserByEmail(email);
    const userDoc = await db.collection('users').doc(userRecord.uid).get();

    // Remove OTP from store
    delete otpStore[email];

    return {
      success: true,
      message: 'Login successful',
      data: {
        uid: userRecord.uid,
        ...userDoc.data()
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Error during OTP verification',
      error: error.message
    };
  }
};

export const forgotPassword = async (email: string): Promise<ApiResponse> => {
  try {
    const userRecord = await auth.getUserByEmail(email);
    
    if (!userRecord) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Generate OTP
    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore[email] = { otp, expires };

    // Send OTP email
    const emailSent = await sendVerificationEmail(email, otp);
    if (!emailSent) {
      throw new Error('Failed to send OTP email');
    }

    return {
      success: true,
      message: 'OTP sent to your email for password reset',
      data: { email }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Error during forgot password process',
      error: error.message
    };
  }
};

export const resetPassword = async (email: string, otp: string, newPassword: string): Promise<ApiResponse> => {
  try {
    const storedOTP = otpStore[email];
    if (!storedOTP || storedOTP.expires < Date.now()) {
      return {
        success: false,
        message: 'OTP expired or invalid'
      };
    }

    if (storedOTP.otp !== otp) {
      return {
        success: false,
        message: 'Invalid OTP'
      };
    }

    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    
    // Update password
    await auth.updateUser(userRecord.uid, { password: newPassword });

    // Remove OTP from store
    delete otpStore[email];

    return {
      success: true,
      message: 'Password reset successful'
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Error during password reset',
      error: error.message
    };
  }
};

export const resendOTP = async (email: string, type: 'signup' | 'login' | 'forgot-password'): Promise<ApiResponse> => {
  try {
    const userRecord = await auth.getUserByEmail(email);
    
    if (!userRecord) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Generate new OTP
    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore[email] = { otp, expires };

    // Send OTP email based on type
    let emailSent = false;
    if (type === 'signup' || type === 'forgot-password') {
      emailSent = await sendVerificationEmail(email, otp);
    } else if (type === 'login') {
      emailSent = await sendLoginOTP(email, otp);
    }

    if (!emailSent) {
      throw new Error('Failed to send OTP email');
    }

    return {
      success: true,
      message: 'OTP resent successfully',
      data: { email }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Error during OTP resend',
      error: error.message
    };
  }
}; 