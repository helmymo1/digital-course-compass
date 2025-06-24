const express = require('express');
const router = express.Router();
const { logActivity, getActivityLogs } = require('../controllers/activityLogController');
const { protect, authorize, checkRole } = require('../middleware/authMiddleware');

// @route   POST /api/v1/activity/log
// @desc    Log a user activity
// @access  Private (Authenticated users can log their own activity)
router.post('/log', protect, logActivity);

// @route   GET /api/v1/activity/logs
// @desc    Get activity logs (for admin/analytics)
// @access  Private/Admin
router.get('/logs', protect, checkRole(['Admin']), getActivityLogs); // Or authorize('Admin')

module.exports = router;

// This router should be mounted in server/src/index.js as:
// const activityLogRoutes = require('./routes/activityLogRoutes');
// app.use('/api/v1/activity', activityLogRoutes);
