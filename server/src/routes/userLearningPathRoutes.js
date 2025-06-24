const express = require('express');
const router = express.Router();
const { updateMyLearningPathStatus } = require('../controllers/learningPathController'); // Controller has this function
const { protect } = require('../middleware/authMiddleware');

// Route for updating the status of a user's specific learning path enrollment
// This router will be mounted at /api/v1/user-learning-paths
router.put('/:userPathId', protect, updateMyLearningPathStatus);

module.exports = router;
