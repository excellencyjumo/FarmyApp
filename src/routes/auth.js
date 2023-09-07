import { Router } from "express";
import {
  UpdatePassword,
  RequestToken,
  ResetPassword,
} from "../controllers/auth/index.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/update-password", protect, UpdatePassword);
router.get("/request-token", RequestToken);
router.post("/password-reset", ResetPassword);

export default router;
