import express from "express";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

import {
  addStoreProductToCart,
  getStoreProductToCart,
  removeStoreProductFromCart,
  updateStoreProductToCart,
} from "../../controllers/carts/store.js";
import { updateStoreProduct } from "../../controllers/stores/storeProductsController.js";

router.use(protect);

router.route("/").post(addStoreProductToCart);
router.route("/").get(getStoreProductToCart);
router
  .route("/:_id")
  .delete(removeStoreProductFromCart)
  .put(updateStoreProduct);

export default router;
