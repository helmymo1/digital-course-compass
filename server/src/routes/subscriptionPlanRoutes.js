const express = require('express');
const subscriptionPlanController = require('../controllers/subscriptionPlanController');
const { protect } = require('../middleware/authMiddleware'); // Assuming 'protect' also checks for admin role or use a specific admin middleware

const router = express.Router();

// Middleware to check for admin role - replace with your actual admin check
const adminOnly = (req, res, next) => {
    // Example: Check if req.user exists and has an 'Admin' role
    if (req.user && req.user.roles && req.user.roles.includes('Admin')) {
        next();
    } else {
        // If not using a global error handler for auth, send response directly
        return res.status(403).json({ success: false, message: 'Forbidden: Administrator access required.' });
    }
};

// Admin routes for managing subscription plans
router.post('/', protect, adminOnly, subscriptionPlanController.createSubscriptionPlan);
router.get('/adminlist', protect, adminOnly, subscriptionPlanController.listSubscriptionPlans); // Differentiated admin list route
router.get('/admin/:id', protect, adminOnly, subscriptionPlanController.getSubscriptionPlanById); // Admin get by ID
router.put('/:id', protect, adminOnly, subscriptionPlanController.updateSubscriptionPlan);
router.delete('/:id', protect, adminOnly, subscriptionPlanController.deleteSubscriptionPlan);

// Public routes for listing active plans
router.get('/', subscriptionPlanController.listSubscriptionPlans); // Public list (shows only active)
router.get('/:id', subscriptionPlanController.getSubscriptionPlanById); // Public get by ID (shows only active)


module.exports = router;
