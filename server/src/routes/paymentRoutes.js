const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a payment intent for a course enrollment
router.post('/create-payment-intent', protect, paymentController.createPaymentIntent);

// Stripe webhook endpoint - Note: Stripe webhooks usually don't go through typical auth middleware
// Stripe sends a signature in the header that we'll verify.
// The path should be memorable as it's configured in the Stripe Dashboard.
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.handleStripeWebhook);


module.exports = router;
