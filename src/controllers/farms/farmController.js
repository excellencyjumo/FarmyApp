import asyncHandler from "express-async-handler";
import Farm from "../../models/farms/farmerModel.js";
import uploadToCloudinary from "../../utils/cloudinary.js";
import FarmProduct from "../../models/farms/farmProductModel.js";
import generateToken from "../../utils/generateFarmToken.js";

// @desc    Register a new farm
// @route   POST /api/farm
// @access  Public
const registerFarm = asyncHandler(async (req, res) => {
  const {
    farmName,
    farmAddress,
    city,
    email,
    username,
    phoneNumber,
    password,
  } = req.body;

  const farmExists = await Farm.findOne({ email });

  if (farmExists) {
    res.status(400);
    throw new Error("Farm Name already exists");
  }
  if (req.file) {
    const result = await uploadToCloudinary(req.file.path);
    const avatar = result.secure_url;
    const farm = await new Farm({
      avatar,
      farmName,
      farmAddress,
      city,
      email,
      username,
      phoneNumber,
      password,
    }).save();

    if (farm) {
      const accessToken = generateToken(res, farm._id);

      res.status(201).json({
        _id: farm._id,
        farmName: farm.farmName,
        email: farm.email,
        avatar: farm.avatar,
        phoneNumber: farm.phoneNumber,
        username: farm.username,
        city: farm.city,
        accessToken,
      });
    } else {
      res.status(400);
      throw new Error("Invalid Farm data");
    }
  } else {
    const farm = await new Farm({
      farmName,
      farmAddress,
      city,
      email,
      username,
      phoneNumber,
      password,
    }).save();

    if (farm) {
      const accessToken = generateToken(res, farm._id);

      res.status(201).json({
        _id: farm._id,
        farmName: farm.farmName,
        email: farm.email,
        phoneNumber: farm.phoneNumber,
        username: farm.username,
        city: farm.city,
        accessToken,
      });
    } else {
      res.status(400);
      throw new Error("Invalid Farm data");
    }
  }
});

// @desc    Get farm profile
// @route   GET /api/farm/profile
// @access  Private
const getFarmProfile = asyncHandler(async (req, res) => {
  const farm = await Farm.findById(req.farm._id);
  const products = await FarmProduct.find({ userId: req.farm._id });

  if (farm) {
    res.json({
      _id: farm._id,
      farmName: farm.farmName,
      email: farm.email,
      avatar: farm.avatar,
      username: farm.username,
      city: farm.city,
      products,
    });
  } else {
    res.status(404);
    throw new Error("Farm not found");
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateFarmProfile = asyncHandler(async (req, res) => {
  const farm = await Farm.findById(req.farm._id);

  if (farm) {
    farm.farmName = req.body.farmName || farm.farmName;
    farm.farmAddress = req.body.farmAddress || farm.farmAddress;
    farm.city = req.body.city || farm.city;
    farm.email = req.body.email || farm.email;
    farm.username = req.body.username || farm.username;
    farm.phoneNumber = req.body.phoneNumber || farm.phoneNumber;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path);
      farm.avatar = result.secure_url;
    }

    if (req.body.password) {
      farm.password = req.body.password;
    }

    const updatedFarmer = await farm.save();

    res.json({
      _id: updatedFarmer._id,
      farmName: updatedFarmer.farmName,
      email: updatedFarmer.email,
      avatar: updatedFarmer.avatar,
      phoneNumber: updatedFarmer.phoneNumber,
      username: updatedFarmer.username,
      city: farm.city,
    });
  } else {
    res.status(404);
    throw new Error("Farm not found");
  }
});

export { registerFarm, getFarmProfile, updateFarmProfile };
