import { Request, Response } from 'express';
import { getProfile as getProfileService, updateProfile as updateProfileService, addAddress as addAddressService, updateAddress as updateAddressService } from '../services/user.service';
import { UpdateProfileData, AddAddressData, UpdateAddressData, ApiResponse } from '../types';

// Get user profile
export const getProfile = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const result = await getProfileService(userId);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

// Update user profile
export const updateProfile = async (req: Request<{}, {}, UpdateProfileData & { userId: string }>, res: Response<ApiResponse>) => {
  try {
    const { userId, ...updateData } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const result = await updateProfileService(userId, updateData);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

// Add new address
export const addAddress = async (req: Request<{}, {}, AddAddressData & { userId: string }>, res: Response<ApiResponse>) => {
  try {
    const { userId, ...addressData } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const result = await addAddressService(userId, addressData);
    return res.status(result.success ? 201 : 404).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

// Update address
export const updateAddress = async (req: Request<{}, {}, UpdateAddressData & { userId: string }>, res: Response<ApiResponse>) => {
  try {
    const { userId, id, ...addressData } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Address ID is required'
      });
    }

    const result = await updateAddressService(userId, id, addressData);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}; 