import express from "express";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

import {
  addFarmProductToCart,
  getFarmProductToCart,
  removeFarmProductFromCart,
  updateFarmProductToCart,
} from "../../controllers/carts/farm.js";
import { updateStoreProduct } from "../../controllers/stores/storeProductsController.js";

router.use(protect);

router.route("/").post(addFarmProductToCart);
router.route("/").get(getFarmProductToCart);
router
  .route("/:_id")
  .delete(removeFarmProductFromCart)
  .put(updateFarmProductToCart);

export default router;
