import express from 'express';
import {
    authStore,
    registerStore,
    logoutStore,
    getStoreProfile,
    getStores,
    updateStoreProfile
} from '../../controllers/stores/storeController.js';
import upload from '../../utils/multer.js';
import { protect } from '../../middleware/sellerAuthMiddleware.js';

const router = express.Router();

router.post('/', upload.single('avatar'), registerStore);
router.post('/auth', authStore);
router.post('/logout', logoutStore);
router.get('/', getStores)
router
  .route('/profile')
  .get(protect, getStoreProfile)
  .put(protect, upload.single('avatar'), updateStoreProfile);

export default router;
