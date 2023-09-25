import { Cart, Order } from '../../models/Cart/cartOrder.js';

import StoreProduct from '../../models/stores/storeProductModel.js';

// Controller functions for cart and order actions
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await StoreProduct.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // To confirm if the requested quantity is available
    if (quantity > product.availableQuantity) {
      return res.status(400).json({ error: 'Not enough quantity available' });
    }

    // Add the item to the user's cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if the product is already in the cart
    const existingItem = cart.items.find((item) => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const viewCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const userCart = await Cart.findOne({ user: req.user._id });

    if (!userCart) {
      return res.status(400).json({ error: "Cart is Unavailable" });
    }

    const { productId, count } = req.query;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // Find the index of the item to remove
    const itemIndex = userCart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found in the cart" });
    }

    if (!count || count <= 0) {
      // Remove the item from the cart if count is not specified or <= 0
      userCart.items.splice(itemIndex, 1);
    } else {
      // Decrease the quantity of the item if count is specified
      if (userCart.items[itemIndex].quantity <= count) {
        // If count is greater than or equal to the item quantity, remove the item
        userCart.items.splice(itemIndex, 1);
      } else {
        // Reduce the item quantity by the specified count
        userCart.items[itemIndex].quantity -= count;
      }
    }

    await userCart.save();

    res.status(200).json({ message: "Item(s) deleted from the cart", data: userCart });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



const deleteCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(400).json({ error: "Cart is Unavailable" });
    }
    res.status(200).json({ message: "Cart deleted", data: cart });
  }
  catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const placeOrder = async (req, res) => {
  try {
    // Check if there are any active (not archived) orders for the user
    const activeOrder = await Order.findOne({
      user: req.user._id,
      paymentStatus:"pending"
    });

    if (activeOrder) {
      return res.status(400).json({ error: 'You have an active order. Please complete or cancel it before placing a new one.' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const totalPrice = cart.items.reduce((total, item) => {
      const productPrice = item.product.price;
      return total + productPrice * item.quantity;
    }, 0);

    // Create an order
    const order = new Order({
      user: req.user._id,
      items: cart.items,
      totalPrice,
      // other order details here
    });

    // This will Update the product quantities in the StoreProduct model 
    // based on the items in the cart
    for (const item of cart.items) {
      const product = await StoreProduct.findById(item.product._id);
      product.availableQuantity -= item.quantity;
      await product.save();
    }

    // Save the order
    await order.save();

    // Clear the user's cart here
    await Cart.findOneAndRemove({ user: req.user._id });

    res.status(201).json(order);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const deleteOrder = async (req, res) => {
  try {
    const order = Order.findOne({ user: req.user._id });
    if (!order) {
      res.status(400).json({ error: "Order not Placed yet" });
    }
    res.status(200).json({ message: "Order deleted", data: order });
  }
  catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export {
  addToCart,
  viewCart,
  deleteItem,
  deleteCart,
  placeOrder,
  deleteOrder,
};
