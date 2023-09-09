import { db, userTypes, checkUserType } from "../../utils/model.js";
import AppError from "../../utils/error.js";
import asyncHandler from "express-async-handler";

export const GetProfile = asyncHandler(async (req, res, next) => {
  const data = await db[req.user.type]
    .findById(req.user.id)
    .select("-password");

  !data && next(new AppError(`${req.query.type} not found`, 401));

  return res.status(200).json({
    status: "success",
    message: `${req.user.type} profile fetched successfully`,
    data,
  });
});
