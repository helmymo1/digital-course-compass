// server/src/routes/enrollmentRoutes.js
const express = require('express');
const enrollmentController = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Assuming authorize is for admin/teacher roles

const router = express.Router();

// Enroll in a course (POST /api/v1/enrollments/course/:courseId)
router.post('/course/:courseId', protect, enrollmentController.enrollInCourse);

// Get enrollments for the logged-in user (GET /api/v1/enrollments/my-enrollments)
router.get('/my-enrollments', protect, enrollmentController.getMyEnrollments);

// Get all enrollments for a specific course (GET /api/v1/enrollments/course/:courseId/users) - Admin/Teacher
router.get('/course/:courseId/users', protect, authorize(['admin', 'teacher']), enrollmentController.getCourseEnrollments);

// Get a specific enrollment by ID (GET /api/v1/enrollments/:enrollmentId)
router.get('/:enrollmentId', protect, enrollmentController.getEnrollmentById);

// Update enrollment status (PUT /api/v1/enrollments/:enrollmentId) - Admin/System
router.put('/:enrollmentId', protect, authorize(['admin', 'system']), enrollmentController.updateEnrollmentStatus); // 'system' role for payment webhook updates

// Cancel an enrollment (DELETE /api/v1/enrollments/:enrollmentId) - User or Admin
router.delete('/:enrollmentId', protect, enrollmentController.cancelEnrollment);

// Admin: Get all enrollments (GET /api/v1/enrollments)
router.get('/', protect, authorize(['admin']), enrollmentController.getAllEnrollments);

// Admin: Bulk enroll users into a course (POST /api/v1/enrollments/bulk)
router.post('/bulk', protect, authorize(['admin']), enrollmentController.bulkEnrollUsers);


module.exports = router;
