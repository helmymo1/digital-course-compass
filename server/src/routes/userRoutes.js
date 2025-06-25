const express = require('express');
const userController = require('../controllers/userController');
const badgeController = require('../controllers/badgeController'); // Added badgeController
const { getUserQuizAttempts } = require('../controllers/quizController'); // Import quiz controller function
const { getMyLearningPaths } = require('../controllers/learningPathController'); // Import learning path controller
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes defined after this middleware will be protected
router.use(authMiddleware.protect); // Protect all user routes

router.get('/me', userController.getMe);
router.get('/me/streak', userController.getUserStreak);
// router.patch('/updateMe', userController.updateMe); // Example for future
// router.patch('/updateMyPassword', authController.updatePassword); // This typically would be in authController

// Get all quiz attempts for the logged-in user
router.get('/me/quiz-attempts', getUserQuizAttempts); // Controller handles 'me' by using req.user.id

// Get all quiz attempts for a specific user (Admin access)
// Ensure this is placed before any /:id routes if :id could be 'me' or 'quiz-attempts'
// Or make sure the controller for /:userId (if it exists) doesn't conflict.
// Given there's no generic /:userId GET route here yet, this should be fine.
router.get('/:userId/quiz-attempts', authMiddleware.checkRole(['Admin']), getUserQuizAttempts);

// Get all learning paths for the logged-in user
router.get('/me/learning-paths', getMyLearningPaths); // Controller uses req.user.id

// Get logged-in user's earned badges
router.get('/me/badges', badgeController.getMyEarnedBadges);


module.exports = router;
