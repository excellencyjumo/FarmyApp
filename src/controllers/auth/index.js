import asyncHandler from "express-async-handler";
import AppError from "../../utils/error.js";

import Logistics from "../../models/logistics/logisticsModel.js";
import Store from "../../models/stores/sellerModel.js";
import User from "../../models/buyer/userModel.js";
import Farm from "../../models/farms/farmerModel.js";

import Email from "../../utils/email.js";

const db = {
  user: User,
  store: Store,
  logistics: Logistics,
  farm: Farm,
};

const userTypes = ["farm", "user", "store"];

const generateVerificationCode = () => {
  const min = 100000;
  const max = 999999;
  const verificationCode = Math.floor(Math.random() * (max - min + 1)) + min;

  return verificationCode.toString();
};

export const RequestToken = asyncHandler(async (req, res, next) => {
  const { email, type } = req.query;

  if (!email) return next(new AppError("Enter your email address", 401));
  if (!type || !userTypes.includes(type))
    return next(
      new AppError(
        "Please provide a valid  user type [either farm, store or logistics]",
        401
      )
    );

  const token = generateVerificationCode();

  const currentDate = new Date();
  currentDate.setMinutes(currentDate.getMinutes() + 10);

  const data = await db[type].findOne({ email });
  if (data) {
    await new Email(email).resetPassword(
      `Your password reset token: <br/> <h1> ${token} </h1>`
    );
    data.token = token;
    data.tokenExpire = currentDate;
  }

  data.save();

  return res.status(200).json({
    status: "success",
    message:
      "Password reset token successfully send to your email if it exsits",
  });
});

export const UpdatePassword = asyncHandler(async (req, res, next) => {
  const { newPassword, oldPassword } = req.body;

  if (!newPassword || !oldPassword)
    return next(
      new AppError(
        "Please provide both the the old password and new password",
        422
      )
    );
  const data = await db[req.user.type]
    .findOne({ _id: req.user._id })
    .select("+password");

  if (!(await data.matchPassword(oldPassword)))
    return next(new AppError("please provide a valid old password", 422));

  data.password = newPassword;
  await data.save();

  data.password = undefined;

  return res.status(200).json({
    status: "success",
    message: "password successfully updated",
    data,
  });
});

export const ResetPassword = asyncHandler(async (req, res, next) => {
  const { token, password } = req.body;
  const { type } = req.query;
  if (!token && !password)
    return next(
      new AppError("Provide both the new password and your reset token", 401)
    );
  if (!type || !userTypes.includes(type))
    return next(
      new AppError(
        "Please provide a valid  user type [either farm, store or logistics]",
        401
      )
    );

  const data = await db[type].findOne({ token });

  const date = new Date();

  if (!data || data.tokenExpire <= date) {
    return next(new AppError("Invalid token or the token has expired"));
  }

  data.password = password;

  data.save();

  return res.status(200).json({
    status: "success",
    message: "password successfully reset",
    data,
  });
});
