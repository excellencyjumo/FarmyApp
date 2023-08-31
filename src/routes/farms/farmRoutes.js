import express from 'express';
import {
    authFarm,
    registerFarm,
    logoutFarm,
    getFarmProfile,
    updateFarmProfile
} from '../../controllers/farms/farmController.js';
import upload from '../../utils/multer.js';
import { farmer } from '../../middleware/farmAuthMiddleware.js';

const router = express.Router();

router.post('/', upload.single('avatar'), registerFarm);
router.post('/auth', authFarm);
router.post('/logout', logoutFarm);
router
  .route('/profile')
  .get(farmer, getFarmProfile)
  .put(farmer, upload.single('avatar'), updateFarmProfile);

export default router;
