import asyncHandler from 'express-async-handler';
import Store from '../../models/stores/sellerModel.js';
import generateToken from '../../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authStore = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const store = await Store.findOne({ email });

  if (store && (await store.matchPassword(password))) {
    generateToken(res, store._id);

    res.json({
      _id: store._id,
      name: store.name,
      email: store.email,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});


// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerStore = asyncHandler(async (req, res) => {
    const { storeName, storeAddress, city, email, username, phoneNumber, password } = req.body;
  
    const storeExists = await Store.findOne({ email });
  
    if (storeExists) {
      res.status(400);
      throw new Error('Store already exists');
    }
  
    const store = await Store.create({
      storeName,
      storeAddress,
      city,
      email,
      username,
      phoneNumber,
      password,
    });
  
    if (store) {
      generateToken(res, store._id);
  
      res.status(201).json({
        _id: store._id,
        storeName: store.storeName,
        email: store.email,
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  });

  // @desc    Logout user / clear cookie
  // @route   POST /api/users/logout
  // @access  Public
const logoutStore = (req, res) => {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
  };
  
// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getStoreProfile = asyncHandler(async (req, res) => {
    const store = await Store.findById(req.store._id);

    if (store) {
        res.json({
        _id: store._id,
        storeName: store.storeName,
        storeAddress: store.storeAddress,
        city: store.city,
        email: store.email,
        username: store.username,
        phoneNumber: store.phoneNumber
        });
    } else {
        res.status(404);
        throw new Error('Store not found');
    }
});


// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateStoreProfile = asyncHandler(async (req, res) => {
    const store = await Store.findById(req.store._id);
  
    if (store) {
      store.storeName = req.body.name || store.storeName;
      store.storeAddress = req.body.storeAddress || store.storeAddress;
      store.city = req.body.city || store.city;
      store.username = req.body.username || store.username;
      store.phoneNumber = req.body.phoneNumber || store.phoneNumber
      store.email = req.body.email || store.email;
  
      if (req.body.password) {
        store.password = req.body.password;
      }
  
      const updatedStore = await store.save();
  
      res.json({
        _id: updatedStore._id,
        storeName: updatedStore.storeName,
        email: updatedStore.email,
      });
    } else {
      res.status(404);
      throw new Error('Store not found');
    }
  });
  

export {
  authStore,
  registerStore,
  logoutStore,
  getStoreProfile,
  updateStoreProfile
};
