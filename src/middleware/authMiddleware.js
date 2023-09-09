import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

import { db } from "../utils/model.js";

import AppError from "../utils/error.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  token = req.cookies.jwt;

  !token &&
    next(new AppError("User not authorized to perform this action", 401));

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await db[decoded.type].findById(decoded.id).select("-password");

  req.user = user;
  next();
});

export { protect };
