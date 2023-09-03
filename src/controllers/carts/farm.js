import asyncHandler from "express-async-handler";
import FarmProduct from "../../models/farms/farmProductModel.js";

import {
  AddToCart,
  GetCartItems,
  RemoveCartItem,
  UpdateItemQuantity,
} from "./factory.js";

export const addFarmProductToCart = AddToCart(FarmProduct, "farm");
export const getFarmProductToCart = GetCartItems("farm");
export const removeFarmProductFromCart = RemoveCartItem("farm");
export const updateFarmProductToCart = UpdateItemQuantity(FarmProduct);
