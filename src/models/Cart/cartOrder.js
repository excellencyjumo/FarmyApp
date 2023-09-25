import {Schema, model} from 'mongoose';

const cartItemSchema = Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'StoreProduct', // Reference to the (Store) product model
  },
  quantity: {
    type: Number,
    default: 1,
  },
});

const cartSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
  },
  items: [cartItemSchema],
});

const orderSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the user model
  },
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
    required: true,
  },
  isArchived:{
      type:Boolean,
      default:'false'
  },
  paymentStatus: {
    type: String,
    enum: ['failed', 'pending', 'paid'],
    default: 'pending', // Default value is 'pending'
  },
  address:{
    type:String,
    default: 'Lagos',
  }
  // other fields for order details (e.g. payment info)
});

const Cart = model('Cart', cartSchema);
const Order = model('Order', orderSchema);

export { Cart, Order };
