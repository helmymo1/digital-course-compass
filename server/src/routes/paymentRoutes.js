const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware'); // Assuming 'protect' is your authentication middleware

const router = express.Router();

// Stripe Routes
// Create a Stripe payment intent for a course enrollment
router.post('/create-payment-intent', protect, paymentController.createPaymentIntent);

// Stripe webhook endpoint
// Stripe sends a signature in the header that we'll verify.
// express.raw() is used to get the raw body for signature verification.
router.post('/stripe/webhook', express.raw({type: 'application/json'}), paymentController.handleStripeWebhook);

// Stripe Subscription Routes
router.post('/stripe/create-subscription', protect, paymentController.createStripeSubscription);
router.post('/stripe/cancel-subscription', protect, paymentController.cancelStripeSubscription);
router.post('/stripe/update-subscription-plan', protect, paymentController.updateStripeSubscriptionPlan);

// PayPal Routes
// Create a PayPal order
router.post('/paypal/create-order', protect, paymentController.createPaypalOrder);

// Capture a PayPal order (typically called by frontend after user approval redirect)
router.post('/paypal/capture-order/:paypalOrderId', protect, paymentController.capturePaypalOrder);

// PayPal webhook endpoint
// express.json() is used here assuming PayPal SDK or verification logic handles parsed body.
// If raw body is needed for PayPal webhook verification, this might need to be express.raw() too.
router.post('/paypal/webhook', express.json(), paymentController.handlePaypalWebhook);

// PayPal Subscription Routes
router.post('/paypal/create-subscription', protect, paymentController.createPaypalSubscription);
router.post('/paypal/cancel-subscription', protect, paymentController.cancelPaypalSubscription);
router.post('/paypal/update-subscription-plan', protect, paymentController.updatePaypalSubscriptionPlan); // Placeholder

// Payment History Route
router.get('/history', protect, paymentController.getUserPaymentHistory);

module.exports = router;
