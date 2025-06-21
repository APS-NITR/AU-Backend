//payment controller.js
const Payment = require('../models/Payment');
const Razorpay = require('../config/razorpay');

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    // Validate input
    if (!amount || !currency) {
      return res.status(400).json({ message: 'Amount and currency are required.' });
    }

    // Create payment order
    const options = {
      amount: amount * 100, // Convert to smallest currency unit
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await Razorpay.orders.create(options);
    res.status(201).json({ order });
  } catch (err) {
    console.error('Create payment error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, orderId, signature } = req.body;

    // Validate input
    if (!paymentId || !orderId || !signature) {
      return res.status(400).json({ message: 'Payment ID, Order ID, and Signature are required.' });
    }

    // Verify payment signature
    const isValid = Razorpay.utils.verifyPaymentSignature({
      order_id: orderId,
      payment_id: paymentId,
      signature
    });

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid payment signature.' });
    }

    // Create payment record
    const payment = await Payment.create({
      paymentId,
      orderId,
      amount: req.body.amount,
      currency: req.body.currency,
      status: 'completed'
    });

    res.status(200).json({ payment });
  } catch (err) {
    console.error('Verify payment error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
// Get payment details
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Validate input
    if (!paymentId) {
      return res.status(400).json({ message: 'Payment ID is required.' });
    }

    // Find payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found.' });
    }

    res.status(200).json({ payment });
  } catch (err) {
    console.error('Get payment details error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

