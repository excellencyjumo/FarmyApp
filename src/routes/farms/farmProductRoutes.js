import express from 'express';
import {
    deleteFarmProduct,
    getAllFarmProducts,
    getFarmProductById,
    createFarmProduct,
    updateFarmProduct,
    createFarmProductReview,
    getTopFarmProducts
} from '../../controllers/farms/farmProductController.js'
import upload from '../../utils/multer.js';
import { farmer, checkFarmProductOwnership } from '../../middleware/farmAuthMiddleware.js';

const router = express.Router();

// @desc fetch all the products, create a product
// @route GET /api/products
// @access PUBLIC 
router
	.route('/')
	.get(getAllFarmProducts)
	.post( upload.array('images', 3), farmer, createFarmProduct);

// @desc fetch top rated products
// @route GET /api/products/top
// @access PUBLIC
router.route('/top').get(getTopFarmProducts);

// @desc Fetch a single product by id, Delete a product,  update a product
// @route GET /api/products/:id
// @access PUBLIC & PRIVATE/ADMIN
router
	.route('/:id')
	.get(getFarmProductById)
	.delete(farmer,checkFarmProductOwnership, deleteFarmProduct)
	.put(upload.array('images', 3), farmer,checkFarmProductOwnership, updateFarmProduct);

// @desc Create a product review
// @route POST /api/products/:id/reviews
// @access PRIVATE
router.route('/:id/reviews').post(createFarmProductReview);

export default router;
