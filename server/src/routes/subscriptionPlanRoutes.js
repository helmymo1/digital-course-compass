const express = require('express');
const subscriptionPlanController = require('../controllers/subscriptionPlanController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Using authorize for role checks

const router = express.Router();

// This specific route as requested
router.get('/pricing/plans', subscriptionPlanController.listSubscriptionPlans);


// Admin routes for managing subscription plans - Assuming this router is mounted under /api/admin/subscription-plans
// If mounted under /api/subscription-plans, then these paths would be /admin, /admin/:id etc.
// For clarity, let's assume a base path like /api/subscription-plans/admin for these
router.post(
    '/admin',
    protect,
    authorize(['admin']), // Ensure 'authorize' middleware can check for 'admin' role
    subscriptionPlanController.createSubscriptionPlan
);

router.get(
    '/admin', // Path becomes /api/subscription-plans/admin (if base is /api/subscription-plans)
    protect,
    authorize(['admin']),
    subscriptionPlanController.listSubscriptionPlans // Controller will check req.path for '/admin'
);

router.get(
    '/admin/:id',
    protect,
    authorize(['admin']),
    subscriptionPlanController.getSubscriptionPlanById
);

router.put(
    '/admin/:id',
    protect,
    authorize(['admin']),
    subscriptionPlanController.updateSubscriptionPlan
);

router.delete(
    '/admin/:id',
    protect,
    authorize(['admin']),
    subscriptionPlanController.deleteSubscriptionPlan
);

// Public routes for listing active plans (if this router is mounted under /api/subscription-plans)
router.get('/', subscriptionPlanController.listSubscriptionPlans); // Path becomes /api/subscription-plans/
router.get('/:id', subscriptionPlanController.getSubscriptionPlanById); // Path becomes /api/subscription-plans/:id


module.exports = router;
// Note: The /api/pricing/plans route is added.
// The admin routes are now structured under an '/admin' sub-path for clarity if this router is mounted at '/api/subscription-plans'.
// The controller's logic `req.path.includes('/admin/')` will work correctly with these adjusted admin paths.
// If the main server mounts this router at '/api', then the paths would be '/api/subscription-plans/admin', etc.
// The key is that the new route '/pricing/plans' when mounted (e.g. at /api) will be '/api/pricing/plans'
// and will not contain '/admin' in its path, so listSubscriptionPlans will filter for active plans.
