const express = require('express');
const router = express.Router();
const {
    createLearningPath,
    getAllLearningPaths,
    getLearningPathById,
    updateLearningPath,
    deleteLearningPath,
    enrollInLearningPath,
    getMyLearningPaths,
    updateMyLearningPathStatus
} = require('../controllers/learningPathController');
const { protect, checkRole } = require('../middleware/authMiddleware');

// Admin/Instructor routes for managing learning paths
router.route('/')
    .post(protect, checkRole(['Admin', 'Instructor']), createLearningPath) // Instructors can also create? Or just Admin?
    .get(protect, getAllLearningPaths); // All logged-in users can see active paths, controller filters by isActive for non-admins

router.route('/:pathId')
    .get(protect, getLearningPathById) // All logged-in users, controller checks isActive for non-admins
    .put(protect, checkRole(['Admin', 'Instructor']), updateLearningPath)
    .delete(protect, checkRole(['Admin', 'Instructor']), deleteLearningPath);

// User-specific routes for learning paths
router.post('/:pathId/enroll', protect, enrollInLearningPath); // Any authenticated user can enroll

// Routes for the logged-in user's learning paths (mounted under /me or similar in main app)
// For now, keeping them here, but typically /me/* routes are grouped.
// If this router is mounted at /api/v1/learning-paths, then these will be:
// GET /api/v1/learning-paths/me (getMyLearningPaths)
// PUT /api/v1/learning-paths/me/:userPathId (updateMyLearningPathStatus) - This is a bit clunky.

// Better to have /me routes separate.
// Let's define a /me/learning-paths route directly in this router for now.
// This assumes this router is mounted at /api/v1/learning-paths.
// The controller for getMyLearningPaths is fine.
// The controller for updateMyLearningPathStatus takes :userPathId (UserLearningPath _id)

// Let's adjust:
// User's own learning path list will be GET /api/v1/users/me/learning-paths (in userRoutes.js)
// Updating a specific UserLearningPath entry could be PUT /api/v1/user-learning-paths/:userPathId

// For now, this router will only handle:
// CRUD on /learning-paths
// POST /learning-paths/:pathId/enroll

// Removing getMyLearningPaths and updateMyLearningPathStatus from here.
// They will be added to userRoutes.js and a new userLearningPathRoutes.js respectively.

// --- Revised learningPathRoutes.js ---
/*
const express = require('express');
const router = express.Router();
const {
    createLearningPath,
    getAllLearningPaths,
    getLearningPathById,
    updateLearningPath,
    deleteLearningPath,
    enrollInLearningPath,
} = require('../controllers/learningPathController');
const { protect, checkRole } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, checkRole(['Admin', 'Instructor']), createLearningPath)
    .get(protect, getAllLearningPaths);

router.route('/:pathId')
    .get(protect, getLearningPathById)
    .put(protect, checkRole(['Admin', 'Instructor']), updateLearningPath)
    .delete(protect, checkRole(['Admin', 'Instructor']), deleteLearningPath);

router.post('/:pathId/enroll', protect, enrollInLearningPath);

module.exports = router;
*/
// This is cleaner. The `getMyLearningPaths` will go to `userRoutes.js` (as `/me/learning-paths`).
// The `updateMyLearningPathStatus` will go to a new `userLearningPathRoutes.js` (as `/:userPathId`).

// Applying this cleaner structure to the file being created:
const express = require('express');
const router = express.Router();
const {
    createLearningPath,
    getAllLearningPaths,
    getLearningPathById,
    updateLearningPath,
    deleteLearningPath,
    enrollInLearningPath
    // getMyLearningPaths and updateMyLearningPathStatus are moved
} = require('../controllers/learningPathController');
const { protect, checkRole } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, checkRole(['Admin', 'Instructor']), createLearningPath)
    .get(protect, getAllLearningPaths); // Controller handles isActive filtering

router.route('/:pathId')
    .get(protect, getLearningPathById) // Controller handles isActive filtering
    .put(protect, checkRole(['Admin', 'Instructor']), updateLearningPath)
    .delete(protect, checkRole(['Admin', 'Instructor']), deleteLearningPath);

router.post('/:pathId/enroll', protect, enrollInLearningPath); // Any authenticated user

module.exports = router;

// This router will be mounted in server/src/index.js:
// const learningPathRoutes = require('./routes/learningPathRoutes');
// app.use('/api/v1/learning-paths', learningPathRoutes);
