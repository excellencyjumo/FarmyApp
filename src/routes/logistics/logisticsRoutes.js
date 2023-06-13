import express from 'express';
import {
    authLogistics,
    registerLogistics,
    logoutLogistics,
    getLogisticsProfile,
    updateLogisticsProfile
} from '../../controllers/logistics/logisticsController.js';
import { protect } from '../../middleware/logisticsAuthMiddleware.js';

const router = express.Router();

router.post('/', registerLogistics);
router.post('/auth', authLogistics);
router.post('/logout', logoutLogistics);
router
  .route('/profile')
  .get(protect, getLogisticsProfile)
  .put(protect, updateLogisticsProfile);

export default router;
