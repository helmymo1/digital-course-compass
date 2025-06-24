const express = require('express');
const router = express.Router();
const {
    getQuizById,
    updateQuiz,
    deleteQuiz,
    submitQuizAttempt,
    getQuizAttemptsByQuiz,
    getQuizAttemptById,
    getUserQuizAttempts // Added this here for now
} = require('../controllers/quizController');
const { protect, authorize, checkRole } = require('../middleware/authMiddleware');

// Routes for specific quizzes
router.route('/:quizId')
    .get(protect, getQuizById) // Students, Instructors, Admins (controller/service layer for finer access)
    .put(protect, checkRole(['Instructor', 'Admin']), updateQuiz)
    .delete(protect, checkRole(['Instructor', 'Admin']), deleteQuiz);

// Route for submitting an attempt to a quiz
router.post('/:quizId/attempt', protect, checkRole(['Student']), submitQuizAttempt);

// Route for getting all attempts for a specific quiz (Instructor/Admin view)
router.get('/:quizId/attempts', protect, checkRole(['Instructor', 'Admin']), getQuizAttemptsByQuiz);

// Routes for specific quiz attempts
router.route('/attempts/:attemptId') // Changed base path to avoid conflict if mounted at /quizzes
    .get(protect, getQuizAttemptById); // Student (own), Instructor, Admin

// Route for a user to get all their quiz attempts
// This could also be /me/attempts and mounted under a user-centric router.
// Or /users/:userId/attempts for admins.
// For simplicity, adding a specific user's attempts route here.
// The controller handles if :userId is 'me' or an actual ID (for admin access).
router.get('/users/:userId/attempts', protect, getUserQuizAttempts);


module.exports = router;

// This router will be mounted in server/src/index.js:
// const quizRoutes = require('./routes/quizRoutes');
// app.use('/api/v1/quizzes', quizRoutes); // For /:quizId routes
// app.use('/api/v1/quiz-attempts', quizRoutes); // For /attempts/:attemptId routes (if separated)
// Or more simply, mount all at /api/v1/quizzes and adjust paths like /:quizId/attempts/:attemptId

// Let's refine the attempt routes to be nested under /quizzes if possible, or have a clear base for attempts.
// Current plan:
// GET /api/v1/quizzes/:quizId/attempts (all attempts for a quiz)
// GET /api/v1/attempts/:attemptId (specific attempt) - This implies /api/v1/attempts should be a base.

// Let's make a new router for /api/v1/attempts
// quizRoutes.js will handle /api/v1/quizzes/...
// quizAttemptRoutes.js will handle /api/v1/attempts/...

// --- Revised approach: ---
// This file (quizRoutes.js) will handle:
// /:quizId
// /:quizId/attempt (POST)
// /:quizId/attempts (GET)

// A new file quizAttemptRoutes.js will handle:
// /:attemptId (GET)
// /users/:userId (GET all attempts for a user) - or this goes in userRoutes

// For now, keeping it combined as per the initial thought, but will adjust paths for clarity.
// The path '/users/:userId/attempts' is better suited for userRoutes.
// Let's remove it from here and add a TODO to put it in userRoutes.js later.

// Revised quizRoutes.js:
/*
const express = require('express');
const router = express.Router();
const {
    getQuizById,
    updateQuiz,
    deleteQuiz,
    submitQuizAttempt,
    getQuizAttemptsByQuiz,
    // getQuizAttemptById, // This will go to a new attempt-specific router
    // getUserQuizAttempts // This will go to userRoutes
} = require('../controllers/quizController');
const { protect, authorize, checkRole } = require('../middleware/authMiddleware');

router.route('/:quizId')
    .get(protect, getQuizById)
    .put(protect, checkRole(['Instructor', 'Admin']), updateQuiz)
    .delete(protect, checkRole(['Instructor', 'Admin']), deleteQuiz);

router.post('/:quizId/attempt', protect, checkRole(['Student']), submitQuizAttempt);
router.get('/:quizId/attempts', protect, checkRole(['Instructor', 'Admin']), getQuizAttemptsByQuiz);

module.exports = router;
*/

// And a new quizAttemptRoutes.js
/*
const express = require('express');
const router = express.Router();
const { getQuizAttemptById } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:attemptId', protect, getQuizAttemptById);
module.exports = router;
// Mounted at /api/v1/attempts
*/

// Sticking with the initial combined file for now to reduce file count,
// but will use distinct base paths for clarity if mounted separately.
// The current single file structure is fine if all routes are logically grouped under quizzes or attempts.
// The controller has `getQuizAttemptById` and `getUserQuizAttempts`.
// So, the routes should be:
// GET /api/v1/quizzes/attempts/:attemptId (for specific attempt)
// GET /api/v1/quizzes/users/:userId/attempts (for user's attempts) - this is a bit clunky under /quizzes

// Simpler:
// quizRoutes.js mounted at /api/v1/quizzes for:
//  /:quizId
//  /:quizId/attempt
//  /:quizId/attempts
// attemptRoutes.js mounted at /api/v1/attempts for:
//  /:attemptId
// userRoutes.js for:
//  /users/:userId/quiz-attempts
//  /me/quiz-attempts

// For THIS file (quizRoutes.js), let's only include routes starting with /:quizId
// Removing getUserQuizAttempts from here.
// Removing getQuizAttemptById from here (will go into a new attempts router).
// This keeps quizRoutes.js focused on operations on a quiz or its direct sub-resources.

// Final structure for this file (quizRoutes.js):
// (controller functions to be adjusted in import)
/*
const express = require('express');
const router = express.Router();
const {
    getQuizById,
    updateQuiz,
    deleteQuiz,
    submitQuizAttempt,
    getQuizAttemptsByQuiz
} = require('../controllers/quizController');
const { protect, checkRole } = require('../middleware/authMiddleware');

router.route('/:quizId')
    .get(protect, getQuizById)
    .put(protect, checkRole(['Instructor', 'Admin']), updateQuiz)
    .delete(protect, checkRole(['Instructor', 'Admin']), deleteQuiz);

router.post('/:quizId/attempt', protect, checkRole(['Student']), submitQuizAttempt);
router.get('/:quizId/attempts', protect, checkRole(['Instructor', 'Admin']), getQuizAttemptsByQuiz);

module.exports = router;
*/
// This is cleaner. I'll proceed with this structure for quizRoutes.js.
// And then create a separate quizAttemptRoutes.js.
// And then add user-specific attempt routes to userRoutes.js.

// Correcting the current file content based on this refined plan:
// (The initial block already reflects this, so I'll just remove the getUserQuizAttempts and getQuizAttemptById)
// No, the initial block has them. I need to generate the cleaner version.

// Overwriting with the cleaner version for quizRoutes.js:
// (This means the `create_file_with_block` will effectively use this new content)
const express = require('express');
const router = express.Router();
const {
    getQuizById,
    updateQuiz,
    deleteQuiz,
    submitQuizAttempt,
    getQuizAttemptsByQuiz
    // getQuizAttemptById and getUserQuizAttempts are moved
} = require('../controllers/quizController');
const { protect, checkRole } = require('../middleware/authMiddleware');

router.route('/:quizId')
    .get(protect, getQuizById)
    .put(protect, checkRole(['Instructor', 'Admin']), updateQuiz)
    .delete(protect, checkRole(['Instructor', 'Admin']), deleteQuiz);

router.post('/:quizId/attempt', protect, checkRole(['Student']), submitQuizAttempt);

router.get('/:quizId/attempts', protect, checkRole(['Instructor', 'Admin']), getQuizAttemptsByQuiz);

module.exports = router;

// This router will be mounted in server/src/index.js:
// const quizRoutes = require('./routes/quizRoutes');
// app.use('/api/v1/quizzes', quizRoutes);
