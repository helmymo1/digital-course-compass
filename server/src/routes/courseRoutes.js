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
const { protect, checkRole, checkEnrollment, authorize } = require('../middleware/authMiddleware'); // Added checkEnrollment and authorize (though authorize might not be used if checkRole is preferred)

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
// Using checkEnrollment middleware to verify enrollment status.
router.post(
    '/:id/reviews',
    protect,
    checkRole(['Student']), // Ensures user has 'Student' role
    checkEnrollment(['active', 'completed']), // Ensures student is/was enrolled and can review
    addCourseReview
);

// --- Routes for Enrolled Students ---
// Placeholder for fetching specific course content data, accessible only by enrolled students
router.get(
    '/:id/content-data',
    protect,
    checkEnrollment(), // Defaults to ['active', 'completed']
    (req, res) => {
        // In a real scenario, this would call a controller function:
        // courseController.getSpecificCourseContent(req, res);
        res.status(200).json({
            success: true,
            message: `Content data for course ${req.params.id} accessible by enrolled user ${req.user.name}`,
            // req.enrollment might be available here if attached by checkEnrollment middleware
        });
    }
);

module.exports = router;
