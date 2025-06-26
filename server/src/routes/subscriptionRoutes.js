const express = require('express');
const paymentController = require('../controllers/paymentController'); // Facade functions are here
const { protect } = require('../middleware/authMiddleware');
// Potentially: const { authorize } = require('../middleware/authMiddleware'); for admin checks if needed on these generic routes

const router = express.Router();

// POST /api/subscriptions
// Body: { planId, gateway: 'stripe' | 'paypal', paymentMethodId (for stripe) }
router.post(
    '/',
    protect,
    paymentController.createSubscriptionFacade
);

// PUT /api/subscriptions/:id
// :id is the UserSubscription database ID
// Body: { newPlanId }
router.put(
    '/:id',
    protect,
    paymentController.updateSubscriptionFacade
);

// Note: GET /api/subscriptions (to list user's subscriptions) and GET /api/subscriptions/:id (to get one)
// are not explicitly requested in the list of new endpoints, but would typically exist.
// These would likely fetch from UserSubscription model, filtering by user.
// For now, only implementing the POST and PUT as per the standardization task for the provided list.

module.exports = router;
