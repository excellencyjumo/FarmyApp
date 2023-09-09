import express from "express";
import {
  registerLogistics,
  updateLogisticsProfile,
} from "../../controllers/logistics/logisticsController.js";
import upload from "../../utils/multer.js";
import { protect } from "../../middleware/logisticsAuthMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", upload.single("avatar"), registerLogistics);
router.route("/profile").put(upload.single("avatar"), updateLogisticsProfile);

export default router;
