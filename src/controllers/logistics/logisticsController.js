import asyncHandler from "express-async-handler";
import Logistics from "../../models/logistics/logisticsModel.js";
import cloudinary from "../../utils/cloudinary.js";
import generateToken from "../../utils/generateLogToken.js";
import Email from '../../utils/email.js';
import { Order } from '../../models/Cart/cartOrder.js'

const registerLogistics = asyncHandler(async (req, res) => {
  const {
    logisticsName,
    logisticsAddress,
    city,
    email,
    username,
    phoneNumber,
    password,
  } = req.body;

  const logisticsExists = await Logistics.findOne({ email });

  if (logisticsExists) {
    res.status(400);
    throw new Error("logistics company already exists");
  }
  let avatar;
  if (req.file) {
    const result = await cloudinary(req.file.path);
    avatar = result.secure_url;
  }

  const logistics = await Logistics.create({
    logisticsName,
    logisticsAddress,
    city,
    email,
    username,
    phoneNumber,
    password,
    avatar,
  });

  if (logistics) {
    generateToken(res, logistics._id);

    res.status(201).json({
      _id: logistics._id,
      logisticsName: logistics.logisticsName,
      email: logistics.email,
    });
  } else {
    res.status(400);
    throw new Error("Invalid logistics data");
  }
});

const updateLogisticsProfile = asyncHandler(async (req, res) => {
  const logistics = await Logistics.findById(req.logistics._id);

  if (logistics) {
    logistics.logisticsName = req.body.logisticsName || logistics.logisticsName;
    logistics.logisticsAddress =
      req.body.logisticsAddress || logistics.logisticsAddress;
    logistics.city = req.body.city || logistics.city;
    logistics.email = req.body.email || logistics.email;
    logistics.username = req.body.username || logistics.username;
    logistics.phoneNumber = req.body.phoneNumber || logistics.phoneNumber;

    if (req.body.password) {
      logistics.password = req.body.password;
    }

    const updatedLogistics = await logistics.save();

    res.json({
      _id: updatedLogistics._id,
      logisticsName: updatedLogistics.logisticsName,
      email: updatedLogistics.email,
    });
  } else {
    res.status(404);
    throw new Error("Logistics Company not found");
  }
});

// Controller function to send orders to logistics companies
const sendOrderToLogistics = async (req, res) => {
  try {
    // Extract order details from the request
    const { logisticsCompanyId } = req.body;
    const orderId = req.params.orderId
    
    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if the order is paid
    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({ error: 'Order is not paid' });
    }

    // Find the logistics company by ID
    const logisticsCompany = await Logistics.findById(logisticsCompanyId);

    if (!logisticsCompany) {
      return res.status(404).json({ error: 'Logistics company not found' });
    }

    // Construct an email notification
    const email = new Email(logisticsCompany.email);
    const subject = 'New Order Notification';
    const message = `An order with ID ${orderId} has been placed and is ready for delivery.`;

    // Send the email notification to the logistics company
    await email.send(subject, message);

    //additional logic to update the order status or perform other actions
    order.isArchived = true;
    await order.save();

    res.status(200).json({ message: 'Order sent to logistics company successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export { registerLogistics, updateLogisticsProfile, sendOrderToLogistics };
