//payment routes
const express = require('express');
const router = express.Router();
const Razorpay = require('../config/razorpay');
const paymentController = require('../controllers/paymentController');
const validateRequest = require('../middleware/validateRequest');
const { paymentValidationRules } = require('../validators/paymentValidator');


// POST /api/payment/create-order   
router.post('/create-order', validateRequest(paymentValidationRules), paymentController.createPayment);
// POST /api/payment/verify
router.post('/verify', validateRequest(paymentValidationRules), paymentController.verifyPayment);
// GET /api/payment/status/:orderId
router.get('/status/:orderId', paymentController.getPaymentStatus);
// GET /api/payment/history/:userId
router.get('/history/:userId', paymentController.getPaymentHistory);
// GET /api/payment/refund/:paymentId
router.get('/refund/:paymentId', paymentController.refundPayment);
// GET /api/payment/cancel/:paymentId
router.get('/cancel/:paymentId', paymentController.cancelPayment);
module.exports = router;

