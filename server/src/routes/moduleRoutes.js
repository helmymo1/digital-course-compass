const express = require('express');
const router = express.Router(); // mergeParams not needed for top-level mount
const {
    // createModule, // Handled by courseRoutes.js
    // getModulesByCourse, // Handled by courseRoutes.js
    getModuleById,
    updateModule,
    deleteModule
} = require('../controllers/moduleController');
const { createLesson, getLessonsByModule } = require('../controllers/lessonController'); // Import lesson controllers
const { protect, authorize } = require('../middleware/authMiddleware'); // Assuming authorize takes roles

// These routes are intended to be mounted at /api/v1/modules

// Routes for /api/v1/modules/:moduleId
router.route('/:moduleId')
    .get(getModuleById) // GET /api/v1/modules/:moduleId
    .put(protect, authorize('Instructor', 'Admin'), updateModule)    // PUT /api/v1/modules/:moduleId
    .delete(protect, authorize('Instructor', 'Admin'), deleteModule); // DELETE /api/v1/modules/:moduleId

// Routes for lessons within a module
// Mounted at /api/v1/modules/:moduleId/lessons
router.route('/:moduleId/lessons')
    .post(protect, authorize('Instructor', 'Admin'), createLesson) // POST /api/v1/modules/:moduleId/lessons
    .get(getLessonsByModule);                                  // GET  /api/v1/modules/:moduleId/lessons

module.exports = router;

// This router should be mounted in server/src/index.js as:
// const moduleRoutes = require('./routes/moduleRoutes');
// app.use('/api/v1/modules', moduleRoutes);
