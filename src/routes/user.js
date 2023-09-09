import { Router } from "express";
import { GetProfile } from "../controllers/user/index.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.get("/", GetProfile);

export default router;
