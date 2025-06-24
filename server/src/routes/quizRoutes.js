const express = require('express');
const router = express.Router();
const {
    getQuizById,
    updateQuiz,
    deleteQuiz
    // createQuizForLesson is in lessonRoutes
    // submitQuizAttempt, getQuizAttemptsByQuiz, getQuizAttemptById, getUserQuizAttempts will be moved
} = require('../controllers/quizController'); // Ensure this path is correct
const { protect, checkRole } = require('../middleware/authMiddleware');

// Routes for specific quizzes
// Mounted at /api/v1/quizzes
router.route('/:quizId')
    .get(protect, getQuizById) // Permissions handled in controller (Student enrolled, Instructor, Admin)
    .put(protect, checkRole(['Instructor', 'Admin']), updateQuiz) // Permissions handled in controller
    .delete(protect, checkRole(['Instructor', 'Admin']), deleteQuiz); // Permissions handled in controller

module.exports = router;
