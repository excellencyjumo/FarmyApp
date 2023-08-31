import asyncHandler from 'express-async-handler';

import StoreCategory from '../../models/stores/storeCategories.js';
import StoreProduct from '../../models/stores/storeProductModel.js';
import uploadToCloudinary from '../../utils/cloudinary.js';
import Store from '../../models/stores/sellerModel.js';
import slugify from 'slugify'
;
const getAllProducts = asyncHandler(async (req, res) => {
    const page = Number(req.query.pageNumber)  || 1;
    const pageSize = Number(req.query.pageSize) || 24;

    const keyword = req.query.keyword
        ? {
            productName: {
                $regex: req.query.keyword,
                $options: 'si',
            },
        }
        :{};
    const count = await StoreProduct.countDocuments({...keyword });

    const products = await StoreProduct.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page-1));

    res.json({ products, page, pages: Math.ceil(count / pageSize) });
})

const getStoreProductsByUserId = asyncHandler(async (req, res) => {
    const page = Number(req.query.pageNumber) || 1;
    const pageSize = Number(req.query.pageSize) || 24;

    const userId = req.params.userId; 

    const keyword = req.query.keyword
        ? {
            userId: userId,
            productName: {
                $regex: req.query.keyword,
                $options: 'si',
            },
        }
        : {
            userId: userId,
        };
    const count = await StoreProduct.countDocuments({ ...keyword });

    const products = await StoreProduct.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

const getStoreProductsBySlug = asyncHandler(async (req, res) => {
    const page = Number(req.query.pageNumber) || 1;
    const pageSize = Number(req.query.pageSize) || 24;

    const storeSlug = req.params.storeSlug; // Assuming you're passing storeSlug in the route parameter

    // Find the store by its slug to get the userId
    const store = await Store.findOne({ slug: storeSlug });

    if (!store) {
        res.status(404).json({ error: 'Store not found' });
        return;
    }

    const userId = store._id; // Assuming the userId field exists in the Store model
	const categories = await StoreCategory.find({ userId });

    const keyword = req.query.keyword
        ? {
            userId: userId,
            productName: {
                $regex: req.query.keyword,
                $options: 'si',
            },
            inStock: true // Only show products with inStock set to true
        }
        : {
            userId: userId,
            inStock: true
        };
    
    const count = await StoreProduct.countDocuments({ ...keyword });

    const products = await StoreProduct.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ 
		storeName: store.storeName,
        storeAddress: store.storeAddress,
        city: store.city,
        username: store.username,
		categories,
		products,
		page, 
		pages: Math.ceil(count / pageSize) });
});


const getAllCategories = asyncHandler(async (req, res) => {
    const page = Number(req.query.pageNumber)  || 1;
    const pageSize = Number(req.query.pageSize) || 24;

    const keyword = req.query.keyword
        ? {
            category: {
                $regex: req.query.keyword,
                $options: 'si',
            },
        }
        :{};
    const count = await StoreCategory.countDocuments({...keyword });

    const categories = await StoreCategory.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page-1));

    res.json({ categories, page, pages: Math.ceil(count / pageSize) });
})

const getStoreCategories = asyncHandler(async (req, res) => {
    const page = Number(req.query.pageNumber)  || 1;
    const pageSize = Number(req.query.pageSize) || 24;

	const storeSlug = req.params.storeSlug; // Assuming you're passing storeSlug in the route parameter

    // Find the store by its slug to get the userId
    const store = await Store.findOne({ slug: storeSlug });

    if (!store) {
        res.status(404).json({ error: 'Store not found' });
        return;
    }

    const userId = store.userId;

	// const userId = req.params.userId;

    const keyword = req.query.keyword
        ? {
			userId: userId,
            category: {
                $regex: req.query.keyword,
                $options: 'si',
            },
        }
        :{};
    const count = await StoreCategory.countDocuments({...keyword });

    const categories = await StoreCategory.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page-1));

    res.json({ categories, page, pages: Math.ceil(count / pageSize) });
})

const getStoreCategoryById = asyncHandler(async (req, res) => {
	const category = await StoreCategory.findById(req.params.id);
    const products = await StoreProduct.find({ category: req.params._id });
	if (category) res.json(category, products);
	else {
		// throw a custom error so that our error middleware can catch them and return apt json
		res.status(404);
		throw new Error('Category not found');
	}
});

const getStoreProductById = asyncHandler(async (req, res) => {
	const product = await StoreProduct.find({store:req.params.userId, _id:req.params.id});
	if (product) res.json(product);
	else {
		// throw a custom error so that our error middleware can catch them and return apt json
		res.status(404);
		throw new Error('Product not found');
	}
});

const getStoreProductBySlug = asyncHandler(async (req, res) => {
	const storeSlug = req.params.storeSlug; // Assuming you're passing storeSlug in the route parameter

    // Find the store by its slug to get the userId
    const store = await Store.findOne({ slug: storeSlug });

    if (!store) {
        res.status(404).json({ error: 'Store not found' });
        return;
    }

    const userId = store.userId;
	const product = await StoreProduct.find({store:userId, slug:req.params.slug});
	if (product) res.json(product);
	else {
		// throw a custom error so that our error middleware can catch them and return apt json
		res.status(404);
		throw new Error('Product not found');
	}
});

const deleteStoreProduct = asyncHandler(async (req, res) => {
	const product = await StoreProduct.findById(req.params.id);
	if (product) {
		await product.deleteOne();
		res.json({ message: 'Product removed from DB' });
	} else {
		// throw a custom error so that our error middleware can catch them and return apt json
		res.status(404);
		throw new Error('Product not found');
	}
});

const deleteStoreCategory = asyncHandler(async (req, res) => {
	const category = await StoreCategory.findById(req.params.id);
	if (category) {
		await category.deleteOne();
		res.json({ message: 'Category removed from DB' });
	} else {
		// throw a custom error so that our error middleware can catch them and return apt json
		res.status(404);
		throw new Error('Category not found');
	}
});

const createStoreProduct = asyncHandler(async (req, res) => {
	const {productName,productDescription,measuringScale,preparationTime, inStock, price, category} = req.body
    var images = []
	// const existingProduct = await FarmProduct.findOne({
	// 	userId: userId,
	// 	productName: productName,
	// 	});

	// if (existingProduct) {
	// // Handle error or update existingProduct
	// } else {
	// // Save the new product
	// await newProduct.save();
	// }

	const slug = slugify(productName, { lower: true })
    
    for(var i=0;i<req.files.length;i++){
      var localFilePath = req.files[i].path
      var result = await uploadToCloudinary(localFilePath)
      images.push(result.secure_url)
    }
	const product = new StoreProduct({
		productName,
        productDescription,
        preparationTime,
        inStock,
        price,
        category,
        measuringScale,
        userId: req.store._id,
        images,
		slug,
        numReviews: 0,
	});
	const createdProduct = await product.save();
	res.status(201).json(createdProduct);
});

const createStoreCategory = asyncHandler(async (req, res) => {
	const {name} = req.body
    

	const slug = slugify(name, { lower: true })
    
    
	const category = new StoreCategory({
		name,
		userId: req.store._id,
        slug
	});
	const createdCategory = await category.save();
	res.status(201).json(createdCategory);
});

const updateStoreProduct = asyncHandler(async (req, res) => {
	const {
		productName,
        productDescription,
        preparationTime,
        inStock,
        price,
        category,
        measuringScale,
	} = req.body;
	const product = await StoreProduct.findById(req.params.id);
	var images = []

	// update the fields which are sent with the payload
	if (product) {
		if (productName) product.productName = productName;
		if (productName) product.slug = slugify(productName, { lower: true });
		if (productDescription) product.productDescription = productDescription;
		if (measuringScale) product.measuringScale = measuringScale;
		if (price) product.price = price;
		if (preparationTime) product.preparationTime = preparationTime;
		if (category) product.category = category;
		if (inStock) product.inStock = inStock;
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

const getTopStoreProducts = asyncHandler(async (req, res) => {
	// get top 4 rated products
	const topProducts = await StoreProduct.find({}).sort({ rating: -1 }).limit(4);
	res.json(topProducts);
});

export {
	getAllCategories,
	getAllProducts,
	getStoreCategories,
	getStoreCategoryById,
	getStoreProductById,
	getStoreProductsBySlug,
	getStoreProductsByUserId,
	updateStoreProduct,
	createStoreProduct,
	deleteStoreProduct,
	createStoreCategory,
	getTopStoreProducts,
	deleteStoreCategory,
	getStoreProductBySlug
}