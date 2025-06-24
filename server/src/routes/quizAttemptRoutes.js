const express = require('express');
// Using mergeParams to access :quizId from parent router if this router is nested.
// e.g., if app.use('/api/v1/quizzes/:quizId/attempts', quizAttemptRoutes);
const router = express.Router({ mergeParams: true });

const {
    submitQuizAttempt,
    getAttemptsForQuiz
} = require('../controllers/quizAttemptController'); // Corrected controller name

const { protect, checkRole } = require('../middleware/authMiddleware');

// These routes are intended to be mounted under a specific quiz, e.g., /api/v1/quizzes/:quizId/attempts
router.route('/')
    .post(protect, checkRole(['Student']), submitQuizAttempt) // POST /api/v1/quizzes/:quizId/attempts
    .get(protect, checkRole(['Instructor', 'Admin']), getAttemptsForQuiz); // GET /api/v1/quizzes/:quizId/attempts

module.exports = router;

// A separate router will be needed for routes like GET /api/v1/quiz-attempts/:attemptId
// Let's call that mainQuizAttemptRouter or similar and define it next.
