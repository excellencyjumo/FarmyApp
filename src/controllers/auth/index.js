import asyncHandler from "express-async-handler";
import AppError from "../../utils/error.js";

import { db, userTypes, checkUserType } from "../../utils/model.js";

import Email from "../../utils/email.js";
import generateToken from "../../utils/generate.js";

const generateVerificationCode = () => {
  const min = 100000;
  const max = 999999;
  const verificationCode = Math.floor(Math.random() * (max - min + 1)) + min;

  return verificationCode.toString();
};

export const LoginUser = asyncHandler(async (req, res, next) => {
  const { type, password, email } = req.body;

  checkUserType(type, req, next);

  const user = await db[type].findOne({ email, type });

  (!email || !password) &&
    next(new AppError("The email and password is required", 401));

  !user && next(new AppError("invalid user credential", 422));

  !(await user.matchPassword(password)) &&
    next(new AppError("invalid user crendential...", 422));

  generateToken(res, user._id, type);

  user.password = undefined;

  return res.status(200).json({
    status: "success",
    message: "user successfully created",
    data: user,
  });
});

export const Logout = asyncHandler(async (req, res, next) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  return res.status(200).json({ message: "Logged out successfully" });
});

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
  checkUserType(type, req, next);

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
