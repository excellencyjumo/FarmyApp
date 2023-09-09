import asyncHandler from "express-async-handler";
import Logistics from "../../models/logistics/logisticsModel.js";
import cloudinary from "../../utils/cloudinary.js";
import generateToken from "../../utils/generateLogToken.js";

const registerLogistics = asyncHandler(async (req, res) => {
  const {
    logisticsName,
    logisticsAddress,
    city,
    email,
    username,
    phoneNumber,
    password,
  } = req.body;

  const logisticsExists = await Logistics.findOne({ email });

  if (logisticsExists) {
    res.status(400);
    throw new Error("logistics company already exists");
  }
  let avatar;
  if (req.file) {
    const result = await cloudinary(req.file.path);
    avatar = result.secure_url;
  }

  const logistics = await Logistics.create({
    logisticsName,
    logisticsAddress,
    city,
    email,
    username,
    phoneNumber,
    password,
    avatar,
  });

  if (logistics) {
    generateToken(res, logistics._id);

    res.status(201).json({
      _id: logistics._id,
      logisticsName: logistics.logisticsName,
      email: logistics.email,
    });
  } else {
    res.status(400);
    throw new Error("Invalid logistics data");
  }
});
const updateLogisticsProfile = asyncHandler(async (req, res) => {
  const logistics = await Logistics.findById(req.logistics._id);

  if (logistics) {
    logistics.logisticsName = req.body.logisticsName || logistics.logisticsName;
    logistics.logisticsAddress =
      req.body.logisticsAddress || logistics.logisticsAddress;
    logistics.city = req.body.city || logistics.city;
    logistics.email = req.body.email || logistics.email;
    logistics.username = req.body.username || logistics.username;
    logistics.phoneNumber = req.body.phoneNumber || logistics.phoneNumber;

    if (req.body.password) {
      logistics.password = req.body.password;
    }

    const updatedLogistics = await logistics.save();

    res.json({
      _id: updatedLogistics._id,
      logisticsName: updatedLogistics.logisticsName,
      email: updatedLogistics.email,
    });
  } else {
    res.status(404);
    throw new Error("Logistics Company not found");
  }
});

export { registerLogistics, updateLogisticsProfile };
