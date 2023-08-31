import express from 'express';
import { waitlistController } from '../controllers/waitlist.js';

const router = express.Router();

// @desc fetch all the products, create a product
// @route GET /api/products
// @access PUBLIC 
router
	.route('/')
	.post( waitlistController);

export default router;
