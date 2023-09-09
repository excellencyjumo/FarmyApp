import express from "express";
import {
  registerUser,
  updateUserProfile,
} from "../../controllers/buyers/userController.js";
import upload from "../../utils/multer.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", upload.single("avatar"), registerUser);

router
  .route("/profile")
  .put(protect, upload.single("avatar"), updateUserProfile);

export default router;
