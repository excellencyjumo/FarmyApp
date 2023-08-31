import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import Store from '../models/stores/sellerModel.js';
import StoreProduct from '../models/stores/storeProductModel.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.store = await Store.findById(decoded.storeId).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

async function checkStoreProductOwnership(req, res, next) {
  const productId = req.params.id;
  const storeId = req.store.id;

  try {
    const product = await StoreProduct.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found'})
    }

    if (product.userId !== storeId) {
      return res.status(403).json({ error: 'You are not the owner of this product' });
    }

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({error: 'Ann error occured while fetching product'});
  }
}

export { protect, checkStoreProductOwnership };
