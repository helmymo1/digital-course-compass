const express = require('express');
const router = express.Router();

// Import controller functions
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollCourse,
  addCourseReview,
  getCourseReviews,
} = require('../controllers/courseController');

// Import middleware
const { protect, checkRole } = require('../middleware/authMiddleware');

// --- Public Routes ---
// Get all courses (controller handles filtering for status e.g. 'published')
router.get('/', getAllCourses);
// Get a single course by ID (controller handles draft visibility)
router.get('/:id', getCourseById);
// Get all reviews for a specific course (controller handles draft visibility)
router.get('/:id/reviews', getCourseReviews);


// --- Protected Routes ---

// Course CRUD operations (primarily for Instructors & Admins)
router.post('/', protect, checkRole(['Instructor', 'Admin']), createCourse);
// Note: updateCourse and deleteCourse controller logic further checks for course ownership or Admin role.
// For updating, the user must be authenticated. The controller handles if they are owner or Admin.
// For deleting, the user must be authenticated. The controller handles if they are owner or Admin.
// Allowing any authenticated user to *attempt* update/delete, controller does final check.
// If stricter route-level role check is desired for update/delete (e.g. must be Instructor/Admin to even try),
// then add checkRole(['Instructor', 'Admin']) here.
router.put('/:id', protect, updateCourse);
router.delete('/:id', protect, deleteCourse);

// Course Enrollment (for Students)
router.post('/:id/enroll', protect, checkRole(['Student']), enrollCourse);

// Course Reviews (for Students who are enrolled)
// addCourseReview controller logic verifies if the student is enrolled in the course.
router.post('/:id/reviews', protect, checkRole(['Student']), addCourseReview);

module.exports = router;
