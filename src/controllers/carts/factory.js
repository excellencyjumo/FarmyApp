import asyncHandler from "express-async-handler";
import Cart from "../../models/cart.js";

export const AddToCart = (Model, type) => {
  return asyncHandler(async (req, res, next) => {
    const { productId } = req.body;

    if (!productId) {
      return next(new Error("Please select a product to add to cart"));
    }

    const product = await Model.findById(productId);

    if (!product) {
      return next(new Error("This product is not available"));
    }

    if (req.body.quantity > product.availableQuantity) {
      return next(
        new Error(
          `We only have ${product.availableQuantity} available quantity`
        )
      );
    }

    const cart = await Cart.findOne({ productId });
    if (cart) {
      return next(new Error("This item has aleady been added to cart"));
    }

    const response = await Cart.create({
      userId: req.user._id,
      productId,
      quantity: req.body.quantity,
      type,
    });
    return res.status(200).json({
      status: "success",
      message: "item added to cart successfully",
      data: { product, quantity: response.quantity },
    });
  });
};

export const GetCartItems = (type) => {
  return asyncHandler(async (req, res, next) => {
    const data = await Cart.find({ userId: req.user.id, type });

    return res.status(200).json({
      status: "success",
      message: "cart items succesfully fetched",
      data,
    });
  });
};

export const RemoveCartItem = (type) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.params._id) {
      return next(new Error("Please provide select an item to be deleted"));
    }
    const data = await Cart.findOneAndDelete({
      userId: req.user._id,
      type,
      _id: req.params._id,
    });

    return res.status(204).json({
      status: "success",
      message: "item successfully removed from cart",
    });
  });
};

export const UpdateItemQuantity = (Model) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.params._id) {
      return next(new Error("Please provide select an item to be updated"));
    }

    const response = await Model.findById(req.params._id);

    if (req.body.quantity > response.quantity) {
      return next(
        new Error(
          `You can only add ${response.quantity} quantities to cart presently`
        )
      );
    }

    const data = await Cart.findOneAndUpdate(
      {
        userId: req.user._id,
        _id: req.params._id,
      },
      { quantity: req.body.quantity }
    );

    return res.status(200).json({
      status: "success",
      message: "item quantity successfully updated",
      data,
    });
  });
};
