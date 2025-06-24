const express = require('express');
const router = express.Router();
const { getQuizAttemptById } = require('../controllers/quizController'); // Controller still has this function
const { protect } = require('../middleware/authMiddleware');

// Route for getting a specific quiz attempt by its ID
// This router will be mounted at /api/v1/attempts
router.get('/:attemptId', protect, getQuizAttemptById);

module.exports = router;
