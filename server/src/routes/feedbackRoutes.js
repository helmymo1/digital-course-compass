const express = require('express');
const router = express.Router();
const {
    submitFeedback,
    getAllFeedback,
    getFeedbackById,
    updateFeedback,
    deleteFeedback
} = require('../controllers/feedbackController');
const { protect, checkRole } = require('../middleware/authMiddleware');

// Route for users to submit feedback
router.post('/', protect, submitFeedback);

// Admin routes for managing feedback
router.get('/', protect, checkRole(['Admin']), getAllFeedback);
router.route('/:feedbackId')
    .get(protect, checkRole(['Admin']), getFeedbackById)
    .put(protect, checkRole(['Admin']), updateFeedback)
    .delete(protect, checkRole(['Admin']), deleteFeedback);

module.exports = router;

// This router will be mounted in server/src/index.js:
// const feedbackRoutes = require('./routes/feedbackRoutes');
// app.use('/api/v1/feedback', feedbackRoutes);
