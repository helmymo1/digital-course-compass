const mongoose = require('mongoose'); // Added for ObjectId validation
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User'); // May not be needed directly if relying on req.user

// @desc    Enroll in a course
// @route   POST /api/v1/enrollments/course/:courseId
// @access  Private (User)
exports.enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id; // Assuming protect middleware adds user to req

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if already enrolled (and active or pending)
    const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId, status: { $in: ['active', 'pending_payment'] } });
    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this course or enrollment is pending payment.' });
    }

    // For now, directly create enrollment. Payment logic will adjust this.
    // If course is free, status: 'active'. If paid, status: 'pending_payment'
    // This will be refined in the payment integration step.
    const enrollmentData = {
        user: userId,
        course: courseId,
        // status: course.price > 0 ? 'pending_payment' : 'active', // Assuming Course model has a price field
    };

    // Simplified: Assume all courses for now might need payment or manual activation
    // This will be more fleshed out when payment intent is introduced
    if (course.price && course.price > 0) { // Check if course has a price and it's greater than 0
        enrollmentData.status = 'pending_payment';
    } else {
        enrollmentData.status = 'active'; // Free course
    }


    const enrollment = await Enrollment.create(enrollmentData);

    res.status(201).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    console.error('Enrollment Error:', error);
    if (error.code === 11000) { // Duplicate key error (from the unique index)
        return res.status(400).json({ success: false, message: 'Duplicate enrollment detected. You might already be actively enrolled or have a pending enrollment.' });
    }
    res.status(500).json({ success: false, message: 'Server error while enrolling in course', error: error.message });
  }
};

// @desc    Get enrollments for the logged-in user
// @route   GET /api/v1/enrollments/my-enrollments
// @access  Private (User)
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id }).populate('course', 'title description instructor'); // Populate course details
    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    console.error('Get My Enrollments Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching user enrollments' });
  }
};

// @desc    Get all enrollments for a specific course
// @route   GET /api/v1/enrollments/course/:courseId/users
// @access  Private (Admin/Teacher)
exports.getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollments = await Enrollment.find({ course: courseId }).populate('user', 'name email'); // Populate user details

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    console.error('Get Course Enrollments Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching course enrollments' });
  }
};

// @desc    Get a specific enrollment by ID
// @route   GET /api/v1/enrollments/:enrollmentId
// @access  Private (User who owns it, or Admin/Teacher for any)
exports.getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.enrollmentId).populate('user', 'name email').populate('course', 'title');
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Check if the user is an admin/teacher or the owner of the enrollment
    const isAdminOrTeacher = req.user.roles.some(role => ['admin', 'teacher'].includes(role.toLowerCase()));
    if (enrollment.user._id.toString() !== req.user.id && !isAdminOrTeacher) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this enrollment' });
    }

    res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    console.error('Get Enrollment By ID Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// @desc    Update enrollment status (e.g., by admin or payment webhook)
// @route   PUT /api/v1/enrollments/:enrollmentId
// @access  Private (Admin/System)
exports.updateEnrollmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required for update.' });
    }
    // Validate status against enum values
    if (!Enrollment.schema.path('status').enumValues.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value.'});
    }

    const enrollment = await Enrollment.findByIdAndUpdate(req.params.enrollmentId, { status }, {
      new: true,
      runValidators: true,
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    console.error('Update Enrollment Status Error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating enrollment' });
  }
};

// @desc    Cancel an enrollment
// @route   DELETE /api/v1/enrollments/:enrollmentId
// @access  Private (User who owns it or Admin)
exports.cancelEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.enrollmentId);

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Allow user to cancel their own enrollment, or admin to cancel any
    const isAdmin = req.user.roles.map(r=>r.toLowerCase()).includes('admin');
    if (enrollment.user.toString() !== req.user.id && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Not authorized to cancel this enrollment' });
    }

    // Instead of deleting, often it's better to change status to 'cancelled'
    // This preserves history and helps with potential refund processes.
    // If a hard delete is desired, use enrollment.remove() or Enrollment.findByIdAndDelete()
    enrollment.status = 'cancelled';
    // Optionally, clear paymentId or add notes about cancellation reason
    await enrollment.save();
    // await Enrollment.findByIdAndDelete(req.params.enrollmentId); // For hard delete

    res.status(200).json({
      success: true,
      message: 'Enrollment cancelled successfully', // Or "Enrollment deleted successfully" if hard delete
      data: enrollment // Return the updated enrollment
    });
  } catch (error) {
    console.error('Cancel Enrollment Error:', error);
    res.status(500).json({ success: false, message: 'Server error while cancelling enrollment' });
  }
};

// @desc    Get all enrollments (Admin only)
// @route   GET /api/v1/enrollments
// @access  Private (Admin)
exports.getAllEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({})
            .populate('user', 'name email')
            .populate('course', 'title');

        res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrollments,
        });
    } catch (error) {
        console.error('Get All Enrollments Error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching all enrollments' });
    }
};
