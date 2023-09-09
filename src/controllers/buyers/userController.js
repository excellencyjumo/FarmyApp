import asyncHandler from "express-async-handler";
import User from "../../models/buyer/userModel.js";
import generateToken from "../../utils/generateUserToken.js";
import cloudinary from "../../utils/cloudinary.js";

import AppError from "../../utils/error.js";

const registerUser = asyncHandler(async (req, res, next) => {
  const { name, username, phoneNumber, email, password } = req.body;
  let avatar;

  const emailExists = await User.findOne({ email });
  const passExists = await User.findOne({ phoneNumber });

  if (emailExists) {
    return next(new AppError("user credential already exists", 409));
  }
  if (phoneNumber && passExists) {
    return next(new AppError("user credential already exists", 409));
  }

  if (req.file) {
    avatar = (await cloudinary(req.file.path)).secure_url;
  }

  const user = await User.create({
    avatar,
    name,
    username,
    phoneNumber,
    email,
    password,
  });
  generateToken(res, user._id);
  return res.status(201).json({
    status: "created",
    message: "User successfully created",
    data: user,
  });
});

// Update user data
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  !user && next(new AppError("user data not found", 404));

  if (!req.body.password)
    return next(
      new AppError(
        "Use the designated endpoint for passwore updating for this action",
        401
      )
    );

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
  user.username = req.body.username;
  if (req.file) {
    const result = await cloudinary(req.file.path);
    user.avatar = result.secure_url;
  }

  const data = await user.save();

  res.status(200).json({
    status: "success",
    message: "user profile successfully updated",
    data,
  });
});

export { registerUser, updateUserProfile };
