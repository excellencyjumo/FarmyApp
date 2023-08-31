import asyncHandler from 'express-async-handler';
// import FarmProduct from '../../models/farms/farmerProductModel.js';
import FarmProduct from '../../models/farms/farmProductModel.js';
import uploadToCloudinary from '../../utils/cloudinary.js'

// @desc fetch all the farm products
// @route GET /api/farmproducts
// @access PUBLIC
const getAllFarmProducts = asyncHandler(async (req, res) => {
	const page = Number(req.query.pageNumber) || 1; // the current page number being fetched
	const pageSize = Number(req.query.pageSize) || 24; // the total number of entries on a single page

	// match all products which include the string of chars in the keyword, not necessarily in the given order
	const keyword = req.query.keyword
		? {
				productName: {
					$regex: req.query.keyword,
					$options: 'si',
				},
		  }
		: {};
	const count = await FarmProduct.countDocuments({ ...keyword }); // total number of products which match with the given key

	// find all products that need to be sent for the current page, by skipping the documents included in the previous pages
	// and limiting the number of documents included in this request
	const products = await FarmProduct.find({ ...keyword })
		.limit(pageSize)
		.skip(pageSize * (page - 1));

	// send the list of products, current page number, total number of pages available
	res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// const getMyFarmProducts = 

// @desc Fetch a single product by id
// @route GET /api/products/:id
// @access PUBLIC
const getFarmProductById = asyncHandler(async (req, res) => {
	const product = await FarmProduct.findById(req.params.id);
	if (product) res.json(product);
	else {
		// throw a custom error so that our error middleware can catch them and return apt json
		res.status(404);
		throw new Error('Product not found');
	}
});


// @desc Delete a product
// @route DELETE /api/products/:id
// @access PRIVATE/ADMIN
const deleteFarmProduct = asyncHandler(async (req, res) => {
	const product = await FarmProduct.findById(req.params.id);
	if (product) {
		await product.deleteOne();
		res.json({ message: 'Product removed from DB' });
	} else {
		// throw a custom error so that our error middleware can catch them and return apt json
		res.status(404);
		throw new Error('Product not found');
	}
});


// @desc Create a product
// @route POST /api/products/
// @access PRIVATE/Farmer
const createFarmProduct = asyncHandler(async (req, res) => {
	const {productName,productDescription,measuringScale, perUnitPrice, availabilityDate, availableQuantity} = req.body
    var images = []
    
    for(var i=0;i<req.files.length;i++){
      var localFilePath = req.files[i].path
      var result = await uploadToCloudinary(localFilePath)
      images.push(result.secure_url)
    }
	const product = new FarmProduct({
		productName,
        productDescription,
        measuringScale,
        perUnitPrice,
        availabilityDate,
        availableQuantity,
        userId: req.farm._id,
        images,
        numReviews: 0,
	});
	const createdProduct = await product.save();
	res.status(201).json(createdProduct);
});


// @desc Update a product
// @route PUT /api/products/:id
// @access PRIVATE/Farmer
const updateFarmProduct = asyncHandler(async (req, res) => {
	const {
		productName,
        productDescription,
        measuringScale,
        perUnitPrice,
        availabilityDate,
        availableQuantity
	} = req.body;
	const product = await FarmProduct.findById(req.params.id);
	var images = []

	// update the fields which are sent with the payload
	if (product) {
		if (productName) product.productName = productName;
		if (productDescription) product.productDescription = productDescription;
		if (measuringScale) product.measuringScale = measuringScale;
		if (perUnitPrice) product.perUnitPrice = perUnitPrice;
		if (availabilityDate) product.availabilityDate = availabilityDate;
		if (availableQuantity) product.availableQuantity = availableQuantity;
		if (req.files) for(var i=0;i<req.files.length;i++){
			var localFilePath = req.files[i].path
			var result = await uploadToCloudinary(localFilePath)
			images.push(result.secure_url)
		  }

		const updatedProduct = await product.save();
		if (updatedProduct) res.status(201).json(updatedProduct);
	} else {
		res.status(404);
		throw new Error('Product not available');
	}
});


// @desc Create a product review
// @route POST /api/products/:id/reviews
// @access PRIVATE
const createFarmProductReview = asyncHandler(async (req, res) => {
	const { rating, review } = req.body;
	const product = await FarmProduct.findById(req.params.id);
	if (product) {
		// If the user has already reviewed this product, throw an error
		const reviewedAlready = product.reviews.find(
			(rev) => rev.user.toString() === req.user._id.toString()
		);
		if (reviewedAlready) {
			res.status(400);
			throw new Error('Product Already Reviewed');
		}

		const newReview = {
			name: req.user.name,
			user: req.user._id,
			avatar: req.user.avatar,
			rating: Number(rating),
			review,
		};

		// store the new review and update the rating of this product
		product.reviews.push(newReview);
		product.numReviews = product.reviews.length;
		product.rating =
			product.reviews.reduce((acc, ele) => acc + ele.rating, 0) /
			product.numReviews;
		const updatedProduct = await product.save();
		if (updatedProduct) res.status(201).json({ message: 'Review Added' });
	} else {
		res.status(404);
		throw new Error('Product not available');
	}
});

// @desc fetch top rated products
// @route GET /api/products/top
// @access PUBLIC
const getTopFarmProducts = asyncHandler(async (req, res) => {
	// get top 4 rated products
	const topProducts = await FarmProduct.find({}).sort({ rating: -1 }).limit(4);
	res.json(topProducts);
});

export {
	getFarmProductById,
	getAllFarmProducts,
	deleteFarmProduct,
	createFarmProduct,
	updateFarmProduct,
	createFarmProductReview,
	getTopFarmProducts,
};