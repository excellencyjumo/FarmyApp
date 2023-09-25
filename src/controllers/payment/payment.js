// // Import the Paystack SDK or the SDK for your chosen payment gateway
import paystack from 'paystack';
const paystackClient = paystack('sk_test_e4233e7eaa7d826f417a91232cd83eefbf74fd0c');
import { Order } from '../../models/Cart/cartOrder.js'; // Import your order model
import { SellersWallet } from '../../models/payment/wallet.js'

// Controller function to initiate a payment
const initiatePayment = async (req, res) => {
  try {
    // Fetch the order associated with the user
    const order = await Order.findOne({
      user: req.user._id,
      paymentStatus: 'pending', // Ensure the order is in the correct state to initiate payment
    }).populate('items.product');

    if (!order || order.items.length === 0) {
      return res.status(400).json({ error: 'Order is unavailable or has already been processed' });
    }

    // Create a payment request on Paystack
    const paymentData = {
      email: req.user.email, // Use the user's email
      amount: order.totalPrice * 100, // Amount in kobo (Nigerian currency, multiplied by 100)
      currency: 'NGN', // Nigerian Naira
      reference: `order_${order._id}`, // You can use a unique reference
      callback_url: 'localhost:3500/api/v1/payment/verify/:referenceId', // callback URL
      metadata: {
        order_id: order._id,
        user_id: req.user._id,
      },
    };

    const paymentResponse = await paystackClient.transaction.initialize(paymentData);
    console.log(paymentResponse);

    if(!paymentResponse.status){
      return res.status(400).json({message:paymentResponse});
    }
    
    // Return the authorization URL and reference for the user to complete the payment
    res.status(201).json({
      authorization_url: paymentResponse.data.authorization_url,
      reference: paymentResponse.data.reference,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Controller function to handle Paystack callback
const verifyPayment = async (req, res) => {
  try {
    const reference = req.params.referenceId;
    const transaction = await paystackClient.transaction.verify(reference);
    // Check the status of the transaction
    if (transaction.status) {
      // Update your order status or perform any necessary actions
      const orderId = transaction.data.metadata.order_id;
      const order = await Order.findById(orderId).populate('items.product');

      //Invalid OrderId
      if(!order){
        return res.status(200).json({ message: 'Order cant be Found' });
      }

      // Check if the order's payment status is already "Payment Successful"
      if (order.paymentStatus === 'paid') {
        return res.status(200).json({ message: 'Payment has already been processed for this order' });
      }

      // Check if the order is archived
      if (order.isArchived) {
        return res.status(200).json({ message: 'Order Verified Already.' });
      }

      // Update the order's payment status to "paid" and isArchived to true
      order.paymentStatus = 'paid';

      // Loop through the items in the order, which may belong to multiple sellers
      for (const item of order.items) {
        const product = item.product;
        const sellerId = product.userId; // Assuming you have a seller field in your product schema

        // Find the seller's wallet or create it if it doesn't exist
        let wallet = await SellersWallet.findOne({ seller: sellerId });

        if (!wallet) {
          // Create a new wallet for the seller
          wallet = new SellersWallet({
            seller: sellerId,
            balance: 0, // Initialize balance to 0
          });
        }

        // Update the seller's wallet balance
        wallet.balance += item.quantity * product.price;

        // Save the wallet
        await wallet.save();
      }

      // Save the updated order
      await order.save();

      return res.status(200).json({ message: 'Payment successful' });
    }

    // Handle failed or pending payments
    return res.status(400).json({ error: 'Payment failed', message: 'Please try again' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export { initiatePayment, verifyPayment };