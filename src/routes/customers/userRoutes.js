import express from 'express';
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
} from '../../controllers/buyers/userController.js';
import upload from '../../utils/multer.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', upload.single('avatar'), registerUser);
router.post('/auth', authUser);
router.post('/logout', logoutUser);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload.single('avatar'), updateUserProfile);

export default router;
