import { Router } from 'express';
import { getProfile, updateProfile, addAddress, updateAddress, uploadLogo, updateBankDetails } from '../controllers/user.controller';
import upload from '../middleware/upload';

const router = Router();

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Address routes
router.post('/address', addAddress);
router.put('/address', updateAddress);

// Logo upload route
router.post('/logo', upload.single('logo'), uploadLogo);

// Bank details update route
router.post('/bank-details', updateBankDetails);

export default router; 