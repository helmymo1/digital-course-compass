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
  getCourseRecommendations,
  getPopularCourses,
  getTrendingCourses,
  getSimilarCourses, // Added getSimilarCourses
} = require('../controllers/courseController');
const { createModule, getModulesByCourse } = require('../controllers/moduleController'); // Import module controllers
const { getCourseProgress } = require('../controllers/studentProgressController'); // Import progress controller

// Import middleware
const { protect, checkRole, checkEnrollment, authorize } = require('../middleware/authMiddleware'); // Added checkEnrollment and authorize (though authorize might not be used if checkRole is preferred)

// --- Public Routes ---
// Get all courses (controller handles filtering for status e.g. 'published')
router.get('/', getAllCourses); // This is also /api/search/courses effectively

// Get popular courses - place before /:id to ensure correct matching
router.get('/popular', getPopularCourses);

// Get trending courses - place before /:id
router.get('/trending', getTrendingCourses);

// Get courses similar to a specific course - place before /:id to avoid 'similar' being treated as an ID.
// Or, ensure the parameter name is different, e.g., /similar/:courseIdParam
// Using /similar/:courseId as per plan. This should be distinct enough from /:id if /:id uses a more generic 'id'.
// If :id can match 'similar', then order matters or regex constraints on :id are needed.
// For clarity and safety, placing it before generic /:id is good practice if params could clash.
// However, Express matches routes in order. If `/similar/:courseId` is specific, it might be fine.
// To be safe, let's ensure it's distinct or ordered carefully.
// The current plan has it as /api/courses/similar/:courseId.
// The router base is /api/courses, so the route here is /similar/:courseId.
router.get('/similar/:courseId', getSimilarCourses);


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

// --- Routes for Course Modules ---
// POST a new module to a course (Instructors, Admins)
// GET all modules for a course (public or enrolled users - controller should handle visibility if needed)
// Note: Parameter name here is :id for the course, matching existing routes.
// The moduleController's createModule and getModulesByCourse expect req.params.courseId.
// This will require either:
//   a) The controller to be flexible (check req.params.id or req.params.courseId)
//   b) Middleware to map req.params.id to req.params.courseId before calling the controller
//   c) Renaming :id to :courseId in this file for consistency (major change)
//   d) Updating moduleController to use req.params.id (if these routes are only here)

// For now, let's assume moduleController will be adapted or a small middleware will handle param mapping.
// Or, more simply, ensure moduleController uses the param name as it's passed.
// The `createModule` and `getModulesByCourse` in `moduleController.js` use `req.params.courseId`.
// Let's make courseRoutes.js pass `courseId` correctly.
// This means changing the route parameter name here to :courseId for these specific routes.
// This is the cleanest approach if these module routes are primarily nested under courses.

// Re-evaluating: The moduleController uses `req.params.courseId`.
// The planned routes are /api/v1/courses/:courseId/modules.
// So, this file should use :courseId for these specific routes.
// However, other routes in this file use :id.
// This can lead to inconsistencies if not handled carefully.

// Option: Keep :id and adapt controller (less ideal as controller is for modules)
// Option: Use a new router instance for /:courseId/modules to avoid param conflicts.

// Let's try to keep it simple and assume the controller can be made flexible or we adjust it later.
// For now, using :id as per the file's convention and noting controller needs to be aware.
// The createModule and getModulesByCourse in moduleController.js expect req.params.courseId.
// The routes in moduleRoutes.js were defined as /:courseId/modules.
// For consistency with the new moduleController and moduleRoutes,
// it's better to use :courseId here as well for the module-related endpoints.
// This means courseController.js might need to be updated if it uses :id for courses.
// Looking at courseController.js, it uses :id or :courseId. It seems flexible.
// Let's stick to :courseId for the path to be explicit.

router.route('/:courseId/modules')
    .post(protect, checkRole(['Instructor', 'Admin']), createModule) // req.params.courseId will be available
    .get(getModulesByCourse); // req.params.courseId will be available

// --- Route for Course Progress ---
// GET student's progress for a specific course
// Access: Student (own progress), Instructor of course, Admin
// The controller `getCourseProgress` handles verifying enrollment or role.
// It expects req.params.courseId
router.route('/:courseId/progress')
    .get(protect, getCourseProgress); // protect ensures user is logged in. Controller does further auth.

// --- Routes for Course Recommendations ---
// Personalized recommendations for the logged-in user (must be *before* /:id/recommendations to match correctly)
router.get('/recommendations/me', protect, getCourseRecommendations); // `protect` ensures req.user exists
// Recommendations based on a specific course
router.get('/:id/recommendations', getCourseRecommendations); // :id will be courseId for this context


module.exports = router;
