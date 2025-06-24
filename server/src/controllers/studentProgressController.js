const StudentProgress = require('../models/StudentProgress');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('express-async-handler');

// @desc    Update or Create student progress for a lesson
// @route   POST /api/v1/progress/lessons/:lessonId
// @access  Private/Student
exports.updateLessonProgress = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const userId = req.user._id; // Assuming user ID is available from auth middleware
    const { completed, progressPercentage } = req.body;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        res.status(404);
        throw new Error('Lesson not found');
    }

    // Check if user is enrolled in the course this lesson belongs to
    const enrollment = await Enrollment.findOne({
        user: userId,
        course: lesson.course,
        status: { $in: ['active', 'completed'] } // User must be actively enrolled or have completed
    });

    if (!enrollment) {
        res.status(403);
        throw new Error('User not enrolled in this course or enrollment not active.');
    }

    let studentProgress = await StudentProgress.findOne({ user: userId, lesson: lessonId });

    if (studentProgress) {
        // Update existing progress
        studentProgress.completed = completed !== undefined ? completed : studentProgress.completed;
        studentProgress.progressPercentage = progressPercentage !== undefined ? progressPercentage : studentProgress.progressPercentage;
        studentProgress.lastAccessedAt = Date.now();
    } else {
        // Create new progress entry
        studentProgress = new StudentProgress({
            user: userId,
            course: lesson.course,
            lesson: lessonId,
            completed: completed || false,
            progressPercentage: progressPercentage || 0,
            lastAccessedAt: Date.now(),
        });
    }

    // If completed is set to true, ensure progressPercentage is 100
    if (studentProgress.completed && studentProgress.progressPercentage < 100) {
        studentProgress.progressPercentage = 100;
    }
    // If progress is 100, mark as completed
    if (studentProgress.progressPercentage === 100 && !studentProgress.completed) {
        studentProgress.completed = true;
    }


    const updatedProgress = await studentProgress.save();

    // Optional: After updating lesson progress, recalculate overall course progress for this user
    // and update Enrollment.overallProgressPercentage and Enrollment.status if completed.
    // This can be a separate utility function.
    // await updateOverallCourseProgress(userId, lesson.course);


    res.status(200).json(updatedProgress);
});

// @desc    Get student's progress for all lessons in a course
// @route   GET /api/v1/courses/:courseId/progress
// @access  Private/Student (owner of progress) or Instructor/Admin
exports.getCourseProgress = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user._id; // User whose progress is being fetched

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Authorization:
    // 1. Student can view their own progress if enrolled.
    // 2. Instructor of the course can view progress.
    // 3. Admin can view progress.

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId, status: { $in: ['active', 'completed'] } });

    // if (req.user.roles.includes('Admin') || course.instructor.equals(userId)) {
    //     // Admin or Instructor access - they might want to see all users' progress or specific user.
    //     // This endpoint is currently designed for a student viewing their own progress.
    //     // To support admin/instructor viewing other's progress, you'd pass targetUserId in query/body.
    // } else

    if (!enrollment && !(req.user.roles.includes('Admin') || course.instructor.equals(req.user._id))) {
         res.status(403);
         throw new Error('User not authorized to view this progress or not enrolled.');
    }
    // If an instructor/admin is viewing, and they want a specific user's progress,
    // the userId should come from a query param, not req.user._id directly.
    // For now, this is for the logged-in user's own progress.

    const courseProgress = await StudentProgress.find({ user: userId, course: courseId })
        .populate('lesson', 'title order lessonType duration'); // Populate lesson details

    // Also return overall course progress from Enrollment if available
    const enrollmentDetails = await Enrollment.findOne({ user: userId, course: courseId });

    res.status(200).json({
        courseId,
        userId,
        lessonsProgress: courseProgress,
        overallProgressPercentage: enrollmentDetails ? enrollmentDetails.overallProgressPercentage : 0,
        courseCompleted: enrollmentDetails ? enrollmentDetails.status === 'completed' : false
    });
});

// @desc    Get student's progress for a specific lesson
// @route   GET /api/v1/lessons/:lessonId/progress
// @access  Private/Student (owner) or Instructor/Admin
exports.getLessonSpecificProgress = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const userId = req.user._id; // User whose progress is being fetched

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        res.status(404);
        throw new Error('Lesson not found');
    }

    // Authorization (similar to getCourseProgress)
    const enrollment = await Enrollment.findOne({ user: userId, course: lesson.course, status: { $in: ['active', 'completed'] } });
    const course = await Course.findById(lesson.course); // For instructor check

    // if (req.user.roles.includes('Admin') || (course && course.instructor.equals(userId))) {
    //     // Admin or Instructor access
    // } else

    if (!enrollment && !(req.user.roles.includes('Admin') || (course && course.instructor.equals(req.user._id)))) {
        res.status(403);
        throw new Error('User not authorized to view this progress or not enrolled in the course.');
    }

    const lessonProgress = await StudentProgress.findOne({ user: userId, lesson: lessonId })
        .populate('lesson', 'title order lessonType duration')
        .populate('course', 'title');

    if (!lessonProgress) {
        // No progress record yet, means not started or 0%
        return res.status(200).json({
            lessonId,
            userId,
            completed: false,
            progressPercentage: 0,
            message: "No progress recorded for this lesson yet."
        });
    }

    res.status(200).json(lessonProgress);
});


// Helper function (to be called potentially after updateLessonProgress)
// This should ideally be in a service layer or triggered via model hooks if more complex
async function updateOverallCourseProgress(userId, courseId) {
    const lessonsInCourse = await Lesson.find({ course: courseId }).select('_id');
    if (lessonsInCourse.length === 0) return;

    const lessonIds = lessonsInCourse.map(l => l._id);

    const completedProgressEntries = await StudentProgress.countDocuments({
        user: userId,
        lesson: { $in: lessonIds },
        completed: true
    });

    const overallPercentage = (completedProgressEntries / lessonsInCourse.length) * 100;

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (enrollment) {
        enrollment.overallProgressPercentage = overallPercentage;
        if (overallPercentage === 100 && enrollment.status !== 'completed') {
            enrollment.status = 'completed';
            enrollment.completedAt = Date.now();
        }
        await enrollment.save();
    }
}
// Add this to exports if you want to call it from elsewhere, or integrate its logic directly
// exports.updateOverallCourseProgress = updateOverallCourseProgress;
