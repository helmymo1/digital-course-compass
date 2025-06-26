const express = require('express');
const couponController = require('../controllers/couponController');
const { protect } = require('../middleware/authMiddleware'); // Optional: if userId from token is preferred

const router = express.Router();

// POST /api/coupons/validate
// Body: { couponCode, userId (optional, can be from req.user if protected), items: [...] }
// If userId is needed and should be trusted, 'protect' middleware can be added.
// For now, making it public and allowing userId in body for flexibility (e.g. admin checking for a user)
router.post('/validate', couponController.validateCoupon);


// Example of a protected route for creating coupons (Admin only)
// const { authorize } = require('../middleware/authMiddleware');
// router.post('/', protect, authorize(['admin']), couponController.createCoupon); // Assuming createCoupon exists

module.exports = router;
