const express = require('express');
const router = express.Router();

const { getQuizAttemptById } = require('../controllers/quizAttemptController');
const { protect } = require('../middleware/authMiddleware'); // General protection, specific role checks in controller if needed

// Mounted at /api/v1/quiz-attempts
router.route('/:attemptId')
    .get(protect, getQuizAttemptById); // GET /api/v1/quiz-attempts/:attemptId

module.exports = router;
