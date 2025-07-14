import { auth, db } from '../config/firebase';
import { UserSignupData, UserLoginData, ApiResponse } from '../types/user.types';
import { sendVerificationEmail, sendLoginOTP } from '../config/email';
import { sendSMS } from '../config/sms';
import fetch from 'node-fetch';

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore: { [key: string]: { otp: string; expires: number } } = {};

// Function to generate a random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const signup = async (userData: UserSignupData): Promise<ApiResponse> => {
  try {
    // Add +91 prefix to phone if not present
    let phoneWithPrefix = userData.phone;
    if (!phoneWithPrefix.startsWith('+91')) {
      phoneWithPrefix = '+91' + phoneWithPrefix.replace(/^\+?91/, '').replace(/\D/g, '');
    }

    // Call Architex API to create user
    const architexUrl = `${process.env.ARCHITEX_CUST_URL}/custTable/signup`;
    const architexPayload = {
      Name: userData.contactPerson, // or orgName if needed
      Phone: userData.phone.replace(/^[+]?91/, '').replace(/\D/g, '').slice(-10),
      PCode: '+91',
      City: userData.city,
      ZipCode: userData.pincode,
      Email: userData.email,
      CustGroup: 'Archipreneur',
    };
    const architexRes = await fetch(architexUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(architexPayload),
    });
    const architexData = await architexRes.json();
    if (!architexRes.ok || !architexData.data || !architexData.data.AccountNum) {
      return {
        success: false,
        message: 'Failed to create user in Architex',
        error: architexData.message || 'Architex API error',
      };
    }
    const architexAccountNum = architexData.data.AccountNum;

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

    // Create initial address object
    const initialAddress = {
      id: db.collection('users').doc().id, // Generate a unique ID for the address
      address1: userData.address1,
      address2: userData.address2,
      city: userData.city,
      state: userData.state,
      pincode: userData.pincode,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store user data with addresses array in Firestore, using AccountNum as userId
    await db.collection('users').doc(userRecord.uid).set({
      id: userRecord.uid,
      userId: architexAccountNum,
      orgName: userData.orgName,
      contactPerson: userData.contactPerson,
      designation: userData.designation,
      email: userData.email,
      phone: phoneWithPrefix,
      gstNumber: userData.gstNumber,
      emailVerified: false,
      phoneVerified: false,
      gstVerified: false,
      isSubscribed: false,
      isCrmSubscribed:false,
      addresses: [initialAddress], // Store address as an array
      createdAt: new Date().toISOString(),
      design_credits: 10, // Default credits for new user
      design_count: 0,    // Default design count
    });

    return {
      success: true,
      message: 'User registered successfully. Please verify your email with the OTP sent.',
      data: { uid: userRecord.uid, userId: architexAccountNum }
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
    let userRecord: any = null;
    let userDoc: any = null;
    let loginType: 'email' | 'phone' = 'email';
    let identifier = loginData.email;

    // Check if input is a phone number (contains only digits or starts with +91)
    const phoneRegex = /^\+?91?\d{10}$/;
    if (phoneRegex.test(loginData.email)) {
      loginType = 'phone';
      // Ensure +91 prefix
      let phoneWithPrefix = loginData.email;
      if (!phoneWithPrefix.startsWith('+91')) {
        phoneWithPrefix = '+91' + phoneWithPrefix.replace(/^\+?91/, '').replace(/\D/g, '');
      }
      identifier = phoneWithPrefix;
      // Find user by phone in Firestore
      const userQuery = await db.collection('users').where('phone', '==', phoneWithPrefix).get();
      if (userQuery.empty) {
        return { success: false, message: 'User not found' };
      }
      userDoc = userQuery.docs[0];
      userRecord = { uid: userDoc.id, ...userDoc.data() };
      // If phoneVerified is not true, set it true on OTP verification (handled in verifyPhoneLoginOTP)
    } else {
      // Email login
      userRecord = await auth.getUserByEmail(loginData.email);
      if (!userRecord.emailVerified) {
        return {
          success: false,
          message: 'Please verify your email first'
        };
      }
      userDoc = await db.collection('users').doc(userRecord.uid).get();
      if (!userDoc.exists) {
        throw new Error('User not found');
      }
    }

    // Generate and send OTP
    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore[identifier] = { otp, expires };

    let otpSent = false;
    if (loginType === 'email') {
      otpSent = await sendLoginOTP(loginData.email, otp);
    } else {
      otpSent = await sendSMS(identifier, `Your OTP is: ${otp}`);
    }
    if (!otpSent) {
      throw new Error('Failed to send OTP');
    }

    return {
      success: true,
      message: 'OTP sent to your ' + (loginType === 'email' ? 'email' : 'phone'),
      data: {
        uid: userRecord.uid,
        [loginType]: identifier
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

// Send OTP to phone
export const sendPhoneLoginOTP = async (phone: string): Promise<ApiResponse> => {
  try {
    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000;
    otpStore[phone] = { otp, expires };

    const smsSent = await sendSMS(phone, `Your OTP is: ${otp}`);
    if (!smsSent) throw new Error('Failed to send OTP SMS');

    return { success: true, message: 'OTP sent to your phone' };
  } catch (error: any) {
    return { success: false, message: 'Error sending OTP', error: error.message };
  }
};

export const verifyPhoneLoginOTP = async (phone: string, otp: string): Promise<ApiResponse> => {
  try {
    const storedOTP = otpStore[phone];
    if (!storedOTP || storedOTP.expires < Date.now()) {
      return { success: false, message: 'OTP expired or invalid' };
    }
    if (storedOTP.otp !== otp) {
      return { success: false, message: 'Invalid OTP' };
    }

    // Find user by phone in Firestore
    const userQuery = await db.collection('users').where('phone', '==', phone).get();
    if (userQuery.empty) return { success: false, message: 'User not found' };
    const userDoc = userQuery.docs[0];

    // Set phoneVerified true
    await db.collection('users').doc(userDoc.id).update({ phoneVerified: true });

    delete otpStore[phone];

    return { success: true, message: 'phone verify successful', data: { uid: userDoc.id, ...userDoc.data() } };
  } catch (error: any) {
    return { success: false, message: 'Error during OTP verification', error: error.message };
  }
}; 