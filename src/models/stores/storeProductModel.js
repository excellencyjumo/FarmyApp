import mongoose from 'mongoose'

const storeProductSchema = mongoose.Schema({
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
    price: {
      type: String,
      required: true,
    },
    measuringScale: {
        type: String,
        required: true
    },
    images: {
        type: Array,
    },
    slug: {
      type: String,
      require: true
    },
    preparationTime: {
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
    },
    inStock: {
        type: Boolean,
        default: true
    },
    category: {
        type :String ,
        required:true
    }
  },
  {
    timestamps: true,
  }
)

const StoreProduct = mongoose.model('StoreProduct', storeProductSchema);
export default StoreProduct;