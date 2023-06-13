import express from 'express';
import {
    authStore,
    registerStore,
    logoutStore,
    getStoreProfile,
    updateStoreProfile
} from '../../controllers/stores/storeController.js';
import { protect } from '../../middleware/sellerAuthMiddleware.js';

const router = express.Router();

router.post('/', registerStore);
router.post('/auth', authStore);
router.post('/logout', logoutStore);
router
  .route('/profile')
  .get(protect, getStoreProfile)
  .put(protect, updateStoreProfile);

export default router;
