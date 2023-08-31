import mongoose from 'mongoose';

const farmProductSchema = mongoose.Schema(
  {
    userId: {
        type: String,
        required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productDescription: {
        type: String,
        required: true
    },
    measuringScale: {
        type: String,
        required: true
    },
    perUnitPrice: {
      type: String,
      required: true,
    },
    images: {
        type: Array,
    },
    availabilityDate: {
        type: Date,
    },
    availableQuantity:{
        type: String
    },
    numReviews: {
        type: Number
    },
    rating: {
      type: Number
    }
  },
  {
    timestamps: true,
  }
);
farmProductSchema.index({ userId: 1, productName: 1 }, { unique: true });
const FarmProduct = mongoose.model('FarmProduct', farmProductSchema);

export default FarmProduct;
