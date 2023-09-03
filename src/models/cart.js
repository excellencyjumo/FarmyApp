import mongoose from "mongoose";

const cartSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Please provide the USER ID"],
  },
  productId: {
    type: mongoose.Schema.ObjectId,
    ref: "StoreProduct",
    required: [true, "Please provide the PRODUCT ID"],
  },
  quantity: {
    type: Number,
    default: 1,
  },
  type: {
    type: String,
  },
});

export default mongoose.model("cart", cartSchema);
