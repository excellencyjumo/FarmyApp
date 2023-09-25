// Import necessary dependencies and controllers
import express from 'express';
import { initiatePayment, verifyPayment } from "../../controllers/payment/payment.js";
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

// The routes for payment-related actions

// Route to initiate a payment
router.post('/initiate', protect, initiatePayment);

// Route to handle the payment callback from the payment gateway (e.g., Paystack)
router.get('/verify/:referenceId', verifyPayment);

// Export the router for use in the main application
export default router;
