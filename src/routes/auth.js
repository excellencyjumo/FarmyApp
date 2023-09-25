import { Router } from "express";
import {
  UpdatePassword,
  RequestToken,
  ResetPassword,
  LoginUser,
  Logout,
} from "../controllers/auth/index.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
router.post("/login", LoginUser);
router.post("/logout", Logout);
router.post("/update-password", protect, UpdatePassword);
router.get("/request-token", RequestToken);
router.post("/password-reset", ResetPassword);

export default router;
