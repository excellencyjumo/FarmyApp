import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/buyer/userModel.js';
import Farm from '../models/farms/farmerModel.js';
import Store from '../models/stores/sellerModel.js';
import Logistics from '../models/logistics/logisticsModel.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  token = req.cookies.jwt;

  if (token) {

    const decoded = jwt.verify(token,process.env.JWT_SECRET);

    console.log(decoded)

    if (decoded.userId) {
      try {
        req.user = await User.findById(decoded.userId).select('-password');
        next();
  
        
      } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error('Not authorized, token failed');
      }
    }
    if (decoded.farmId) {
      try {
        req.user = await Farm.findById(decoded.farmId).select('-password');
        next();
  
        
      } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error('Not authorized, token failed');
      }
    }
    if (decoded.storId) {
      try {
        req.user = await Store.findById(decoded.storeId).select('-password');
        next();
  
        
      } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error('Not authorized, token failed');
      }
    }

    if (decoded.logisticsId) {
      try {
        req.user = await Logistics.findById(decoded.logisticsId).select('-password');
        next();
  
        
      } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error('Not authorized, token failed');
      }
    }

  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export { protect };
