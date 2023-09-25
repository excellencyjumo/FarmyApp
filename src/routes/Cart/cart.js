import express from "express";
const router = express.Router();

import {
    addToCart,
    viewCart,
    deleteItem,
    deleteCart,
    placeOrder,
    deleteOrder
} from '../../controllers/Cart/cartOrder.js';

import { protect } from "../../middleware/authMiddleware.js";
  
router.use(protect);

// Cart and order routes
router.post('/', addToCart); // Add-to-cart
router.get('/', viewCart); // View-cart
router.delete('/item',deleteItem) // Delete an Item from a Cart
router.delete('/', deleteCart); // Clear-Cart
router.post('/order', placeOrder); // Place-order
router.delete('/order', deleteOrder); // Delete-order


export default router;