import { Router } from 'express';
import { getProfile, updateProfile, addAddress, updateAddress } from '../controllers/user.controller';

const router = Router();

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Address routes
router.post('/address', addAddress);
router.put('/address', updateAddress);

export default router; 