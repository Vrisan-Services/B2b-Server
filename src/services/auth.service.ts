import { auth, db } from '../config/firebase';
import { UserSignupData, UserLoginData, ApiResponse } from '../types';

export const signup = async (userData: UserSignupData): Promise<ApiResponse> => {
  try {
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.contactPerson,
    });

    // Store additional user data in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      orgName: userData.orgName,
      contactPerson: userData.contactPerson,
      designation: userData.designation,
      email: userData.email,
      phone: userData.phone,
      address1: userData.address1,
      address2:userData.address2,
      city: userData.city,
      state: userData.state,
      pincode: userData.pincode,
      gstNumber:userData.gstNumber,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'User registered successfully',
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

export const login = async (loginData: UserLoginData): Promise<ApiResponse> => {
  try {
    const userRecord = await auth.getUserByEmail(loginData.email);
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

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
      message: 'Error during login',
      error: error.message
    };
  }
}; 