import express from "express";
import {
  registerFarm,
  updateFarmProfile,
} from "../../controllers/farms/farmController.js";
import upload from "../../utils/multer.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", upload.single("avatar"), registerFarm);

router.use(protect);
router.route("/profile").put(upload.single("avatar"), updateFarmProfile);

export default router;
