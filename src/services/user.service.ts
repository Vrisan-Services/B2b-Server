import { db } from '../config/firebase';
import { UserData, UpdateProfileData, AddAddressData, UpdateAddressData, ApiResponse } from '../types';

// Get user profile
export const getProfile = async (userId: string): Promise<ApiResponse> => {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    const userData = userDoc.data() as UserData;
    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: userData
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error retrieving profile',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Update user profile
export const updateProfile = async (userId: string, updateData: UpdateProfileData): Promise<ApiResponse> => {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    await userRef.update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error updating profile',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Add new address
export const addAddress = async (userId: string, addressData: AddAddressData): Promise<ApiResponse> => {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    const userData = userDoc.data() as UserData;
    const addresses = userData.addresses || [];

    // If this is the first address or marked as default, update other addresses
    if (addressData.isDefault) {
      addresses.forEach(addr => addr.isDefault = false);
    }

    const newAddress = {
      id: db.collection('users').doc().id,
      ...addressData,
      isDefault: addressData.isDefault || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await userRef.update({
      addresses: [...addresses, newAddress],
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Address added successfully',
      data: { addressId: newAddress.id }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error adding address',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Update address
export const updateAddress = async (userId: string, addressId: string, addressData: Partial<AddAddressData>): Promise<ApiResponse> => {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    const userData = userDoc.data() as UserData;
    const addresses = userData.addresses || [];
    const addressIndex = addresses.findIndex(addr => addr.id === addressId);

    if (addressIndex === -1) {
      return {
        success: false,
        message: 'Address not found'
      };
    }

    // If setting as default, update other addresses
    if (addressData.isDefault) {
      addresses.forEach(addr => {
        if (addr.id !== addressId) {
          addr.isDefault = false;
        }
      });
    }

    // Update the address
    addresses[addressIndex] = {
      ...addresses[addressIndex],
      ...addressData,
      updatedAt: new Date()
    };

    await userRef.update({
      addresses,
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Address updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error updating address',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}; 