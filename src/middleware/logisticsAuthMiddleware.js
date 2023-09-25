import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import Logistics from "../models/logistics/logisticsModel.js";
import {Order} from "../models/Cart/cartOrder.js"

const protect = asyncHandler(async (req, res, next) => {
  let token;

  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.logistics = await Logistics.findById(decoded.logisticsId).select(
        "-password"
      );

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

const verifyOrderStatus = async (req, res, next) => {
  try {
    // Check if the order is successful
    const orderId = req.params.orderId; // Assuming the orderId is part of the URL
    const order = await Order.findById(orderId);

    if (!order || order.paymentStatus !== 'paid') {
      return res.status(400).json({ error: 'Order is not paid or does not exist' });
    }

    // Continue with the request if the order is valid
    next();
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export { protect, verifyOrderStatus };
