import express from 'express';
import {
    authFarm,
    registerFarm,
    logoutFarm,
    getFarmProfile,
    updateFarmProfile
} from '../../controllers/farms/farmController.js';
import { protect } from '../../middleware/farmAuthMiddleware.js';

const router = express.Router();

router.post('/', registerFarm);
router.post('/auth', authFarm);
router.post('/logout', logoutFarm);
router
  .route('/profile')
  .get(protect, getFarmProfile)
  .put(protect, updateFarmProfile);

export default router;
