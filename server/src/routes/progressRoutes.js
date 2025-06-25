const express = require('express');
const router = express.Router();
const { updateLessonProgress, exportProgress } = require('../controllers/studentProgressController'); // Added exportProgress
const { protect, authorize, checkRole } = require('../middleware/authMiddleware'); // Assuming checkRole for 'Student'

// @route   POST /api/v1/progress/lessons/:lessonId
// @desc    Update or Create student progress for a lesson
// @access  Private/Student
router.post('/lessons/:lessonId', protect, checkRole(['Student']), updateLessonProgress);

// @route   GET /api/v1/progress/export
// @desc    Export student's progress for all enrolled courses
// @access  Private/Student
router.get('/export', protect, checkRole(['Student']), exportProgress);

module.exports = router;

// This router should be mounted in server/src/index.js as:
// const progressRoutes = require('./routes/progressRoutes');
// app.use('/api/v1/progress', progressRoutes);
