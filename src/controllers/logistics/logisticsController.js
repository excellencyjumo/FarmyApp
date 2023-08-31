import asyncHandler from 'express-async-handler';
import Logistics from '../../models/logistics/logisticsModel.js';
import cloudinary from '../../utils/cloudinary.js';
import generateToken from '../../utils/generateLogToken.js';

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authLogistics = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const logistics = await Logistics.findOne({ email });

  if (logistics && (await logistics.matchPassword(password))) {
    generateToken(res, logistics._id);

    res.json({
      _id: logistics._id,
      logisticsName: logistics.logisticsName,
      email: logistics.email,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new logistics
// @route   POST /api/logistics
// @access  Public
const registerLogistics = asyncHandler(async (req, res) => {
    const { logisticsName, logisticsAddress, city, email, username, phoneNumber, password } = req.body;
  
    const logisticsExists = await Logistics.findOne({ email });
  
    if (logisticsExists) {
      res.status(400);
      throw new Error('logistics company already exists');
    }
    const result = await cloudinary(req.file.path);
    avatar = result.secure_url;
  
    const logistics = await Logistics.create({
      logisticsName,
      logisticsAddress,
      city,
      email,
      username,
      phoneNumber,
      password,
      avatar
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
      throw new Error('Invalid logistics data');
    }
});

// @desc    Logout logistics / clear cookie
// @route   POST /api/logistics/logout
// @access  Public
const logoutLogistics = (req, res) => {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getLogisticsProfile = asyncHandler(async (req, res) => {
    const logistics = await Logistics.findById(req.logistics._id);
  
    if (logistics) {
      res.json({
        _id: logistics._id,
        logisticsName: logistics.logisticsName,
        email: logistics.email,
      });
    } else {
      res.status(404);
      throw new Error('Logistics Company not found');
    }
});


// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateLogisticsProfile = asyncHandler(async (req, res) => {
    const logistics = await Logistics.findById(req.logistics._id);
  
    if (logistics) {
      logistics.logisticsName = req.body.logisticsName || logistics.logisticsName;
      logistics.logisticsAddress = req.body.logisticsAddress || logistics.logisticsAddress;
      logistics.city = req.body.city || logistics.city;
      logistics.email = req.body.email || logistics.email;
      logistics.username = req.body.username || logistics.username;
      logistics.phoneNumber = req.body.phoneNumber || logistics.phoneNumber

  
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
      throw new Error('Logistics Company not found');
    }
  });
  
export {
    authLogistics,
    registerLogistics,
    logoutLogistics,
    getLogisticsProfile,
    updateLogisticsProfile
  };