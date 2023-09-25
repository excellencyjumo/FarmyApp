import express from "express";
import {
  registerLogistics,
  updateLogisticsProfile,
  sendOrderToLogistics,
} from "../../controllers/logistics/logisticsController.js";
import upload from "../../utils/multer.js";
import { protect,verifyOrderStatus } from "../../middleware/logisticsAuthMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", upload.single("avatar"), registerLogistics);
router.route("/profile").put(upload.single("avatar"), updateLogisticsProfile);
router.post('/:orderId', verifyOrderStatus, sendOrderToLogistics);

export default router;
