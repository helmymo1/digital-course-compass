const express = require('express');
const router = express.Router(); // Not using mergeParams here, as it's for top-level /lessons/:lessonId
const {
    getLessonById,
    updateLesson,
    deleteLesson
    // createLesson and getLessonsByModule will be handled in moduleRoutes.js
} = require('../controllers/lessonController');
const { getLessonSpecificProgress } = require('../controllers/studentProgressController'); // Import progress controller
// Importing createQuizForLesson and potentially getQuizByLessonId if that's the intended function
const { createQuizForLesson, getQuizByLesson } = require('../controllers/quizController');
const { protect, authorize, checkRole } = require('../middleware/authMiddleware');

// These routes are intended to be mounted at /api/v1/lessons

router.route('/:lessonId')
    .get(getLessonById) // GET /api/v1/lessons/:lessonId
    .put(protect, authorize('Instructor', 'Admin'), updateLesson) // PUT /api/v1/lessons/:lessonId
    .delete(protect, authorize('Instructor', 'Admin'), deleteLesson); // DELETE /api/v1/lessons/:lessonId

// Route for getting progress for a specific lesson
// Access: Student (own progress), Instructor of course, Admin
// Controller `getLessonSpecificProgress` handles further authorization.
router.route('/:lessonId/progress')
    .get(protect, getLessonSpecificProgress); // GET /api/v1/lessons/:lessonId/progress

// Routes for managing a quiz associated with a lesson
router.route('/:lessonId/quiz') // Singular 'quiz' as a lesson has one quiz
    // Assuming getQuizByLesson fetches the quiz using the lessonId.
    // If a quiz ID is known, /api/v1/quizzes/:quizId would be used.
    .get(protect, getQuizByLesson) // Get the quiz for this lesson
    .post(protect, checkRole(['Instructor', 'Admin']), createQuizForLesson); // Create a quiz for this lesson


module.exports = router;

// Note for integration:
// This router will be mounted in server/src/index.js:
// const lessonRoutes = require('./routes/lessonRoutes');
// app.use('/api/v1/lessons', lessonRoutes);

// The routes for creating lessons within a module and getting lessons for a module
// (POST /modules/:moduleId/lessons and GET /modules/:moduleId/lessons)
// will be added to server/src/routes/moduleRoutes.js.
