const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware to check for admin role - replace with your actual admin check
// This is a placeholder. Your actual application should have robust role checking.
const adminOnly = (req, res, next) => {
    if (req.user && req.user.roles && req.user.roles.includes('Admin')) {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Forbidden: Administrator access required.' });
    }
};

// Admin routes for analytics
router.get('/revenue-summary', protect, adminOnly, analyticsController.getRevenueSummary);

module.exports = router;
