import express from "express";
import {
  registerStore,
  getStores,
  updateStoreProfile,
} from "../../controllers/stores/storeController.js";
import upload from "../../utils/multer.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", upload.single("avatar"), registerStore);
router.get("/", getStores);
router.route("/profile").put(upload.single("avatar"), updateStoreProfile);

export default router;
