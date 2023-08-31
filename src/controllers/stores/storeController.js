import asyncHandler from "express-async-handler";
import Store from "../../models/stores/sellerModel.js";
import cloudinary from "../../utils/cloudinary.js";
import generateToken from "../../utils/generateStorToken.js";
import slugify from "slugify";
import StoreProduct from "../../models/stores/storeProductModel.js";
import StoreCategory from "../../models/stores/storeCategories.js";

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
      storeName: store.storeName,
      email: store.email,
      avatar: store.avatar,
      slug: store.slug,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public

const registerStore = asyncHandler(async (req, res) => {
  const {
    storeName,
    storeAddress,
    city,
    email,
    username,
    phoneNumber,
    password,
  } = req.body;
  const storeExists = await Store.findOne({ email });
  console.log(req.body);

  if (storeExists) {
    res.status(400);
    throw new Error("Store already exists");
  }
  if (req.file) {
    const result = await cloudinary(req.file.path);
    const avatar = result.secure_url;

    const slug = slugify(username, { lower: true }); // Generate a slug from the username
    console.log(avatar);
    const store = await Store.create({
      storeName,
      storeAddress,
      city,
      email,
      username,
      phoneNumber,
      password,
      slug,
      avatar,
    });

    if (store) {
      generateToken(res, store._id);

      res.status(201).json({
        _id: store._id,
        storeName: store.storeName,
        email: store.email,
        avatar,
        slug: store.slug, // Include the slug in the response
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } else {
    const slug = slugify(username, { lower: true }); // Generate a slug from the username
    console.log(slug);
    const store = await Store.create({
      storeName,
      storeAddress,
      city,
      email,
      username,
      phoneNumber,
      password,
      slug,
    });
    if (store) {
      generateToken(res, store._id);

      res.status(201).json({
        _id: store._id,
        storeName: store.storeName,
        email: store.email,
        avatar,
        slug: store.slug, // Include the slug in the response
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  }
  // const result = await cloudinary(req.file.path);
  // const avatar = result.secure_url;
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutStore = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getStoreProfile = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.store._id);
  const products = await StoreProduct.find({ userId: req.store._id });
  const categories = await StoreCategory.find({ userId: req.store._id });

  if (store) {
    res.json({
      _id: store._id,
      storeName: store.storeName,
      storeAddress: store.storeAddress,
      city: store.city,
      email: store.email,
      username: store.username,
      phoneNumber: store.phoneNumber,
      avatar: store.avatar,
      slug: store.slug,
      products,
      categories,
    });
  } else {
    res.status(404);
    throw new Error("Store not found");
  }
});

const getStores = asyncHandler(async (req, res) => {
  const { name, page } = req.query;
  const perPage = 24;

  // Fetch user's location from your authentication data
  const userLocation = [req.user.longitude, req.user.latitude]; // Change to your actual user location data

  // Filter stores by name if provided
  const nameQuery = name ? { storeName: { $regex: name, $options: "i" } } : {};

  // Calculate skip value based on the requested page number
  const skip = (page - 1) * perPage;

  // Get all stores and sort by distance
  const stores = await Store.find(nameQuery)
    .sort({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: userLocation,
          },
        },
      },
    })
    .skip(skip)
    .limit(perPage);

  // Count total number of stores
  const totalStores = await Store.countDocuments(nameQuery);

  res.json({
    stores,
    totalPages: Math.ceil(totalStores / perPage),
  });
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
    store.slug = slugify(req.body.username, { lower: true }) || store.slug;
    store.phoneNumber = req.body.phoneNumber || store.phoneNumber;
    store.email = req.body.email || store.email;

    if (req.body.password) {
      store.password = req.body.password;
    }

    const updatedStore = await store.save();

    res.json({
      _id: updatedStore._id,
      storeName: updatedStore.storeName,
      storeSlug: updatedStore.slug,
      email: updatedStore.email,
    });
  } else {
    res.status(404);
    throw new Error("Store not found");
  }
});

export {
  authStore,
  registerStore,
  logoutStore,
  getStoreProfile,
  updateStoreProfile,
  getStores,
};
