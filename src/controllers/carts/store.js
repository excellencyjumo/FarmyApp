import asyncHandler from "express-async-handler";
import StoreProduct from "../../models/stores/storeProductModel.js";

import {
  AddToCart,
  GetCartItems,
  RemoveCartItem,
  UpdateItemQuantity,
} from "./factory.js";

export const addStoreProductToCart = AddToCart(StoreProduct, "store");
export const getStoreProductToCart = GetCartItems("store");
export const removeStoreProductFromCart = RemoveCartItem("store");
export const updateStoreProductToCart = UpdateItemQuantity(StoreProduct);
