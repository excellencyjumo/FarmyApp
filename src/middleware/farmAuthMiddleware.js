import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import Farm from '../models/farms/farmerModel.js';
import FarmProduct from '../models/farms/farmProductModel.js';

const farmer = asyncHandler(async (req, res, next) => {
  let token;

  token = req.cookies.jwt;
  // console.log(token)

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.farm = await Farm.findById(decoded.farmId).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not a farmer so not authorized, no token');
  }
});

// Middleware to check if the logged-in user is the product owner
async function checkFarmProductOwnership(req, res, next) {
  const productId = req.params.id;
  const farmId = req.farm.id;

  try {
    const product = await FarmProduct.findById(productId);


    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.userId !== farmId) {
      return res.status(403).json({ error: 'You are not the owner of this product' });
    }

    // If the user owns the product, proceed to the next middleware
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while fetching the product' });
  }
}



// function checkFarmProductOwnership(req, res, next) {
//   const productId = req.params.productId;
//   const farmId = req.farm.id;

//   // Replace this with your actual database query to fetch the product by ID
//   const product = FarmProduct.findById(productId);
//   console.log(product.userId)
//   console.log(farmId)

//   if (!product) {
//     return res.status(404).json({ error: 'Product not found' });
//   }

//   if (product.userId !== farmId) {
//     return res.status(403).json({ error: 'You are not the owner of this product' });
//   }

//   // If the user owns the product, proceed to the next middleware
//   next();
// }

export { farmer, checkFarmProductOwnership};
