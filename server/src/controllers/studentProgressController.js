const StudentProgress = require('../models/StudentProgress');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('express-async-handler');
const userActivityService = require('../services/userActivityService');
const badgeService = require('../services/badgeService'); // Added badgeService

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
    await updateOverallCourseProgress(userId, lesson.course);

    // If the lesson was completed as part of this update, try to update user's learning streak
    if (updatedProgress.completed) {
        // Intentionally not awaiting this, to not slow down the response to the user for progress update.
        // Streak update can happen in the background.
        userActivityService.updateStreak(userId).catch(err => {
            console.error(`Failed to update streak for user ${userId} after lesson completion:`, err);
        });
    }

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
            await enrollment.save(); // Save enrollment first

            // After course is marked completed, check for course completion badges
            badgeService.checkAndAwardBadges(userId, 'COURSE_COMPLETED', { courseId })
                .catch(err => console.error(`Badge check failed for COURSE_COMPLETED (${courseId}) for user ${userId}:`, err));
        } else {
            // Still save if only percentage changed but not status to completed
            await enrollment.save();
        }
    }
}
// Add this to exports if you want to call it from elsewhere, or integrate its logic directly
// exports.updateOverallCourseProgress = updateOverallCourseProgress;

// @desc    Export student's progress for all enrolled courses
// @route   GET /api/v1/progress/export
// @access  Private/Student
exports.exportProgress = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Fetch all active or completed enrollments for the user
    const enrollments = await Enrollment.find({ user: userId, status: { $in: ['active', 'completed'] } })
        .populate('course', 'title'); // Populate course title

    if (!enrollments || enrollments.length === 0) {
        return res.status(404).json({ message: 'No enrollments found for this user to export progress.' });
    }

    const progressData = [];

    for (const enrollment of enrollments) {
        if (!enrollment.course) continue; // Should not happen if populate worked and course exists

        // Get all lesson progress for this course
        const lessonProgressEntries = await StudentProgress.find({ user: userId, course: enrollment.course._id })
            .populate('lesson', 'title'); // Populate lesson title

        if (lessonProgressEntries.length > 0) {
            for (const lp of lessonProgressEntries) {
                if (!lp.lesson) continue;
                progressData.push({
                    'Course Title': enrollment.course.title,
                    'Lesson Title': lp.lesson.title,
                    'Status': lp.completed ? 'Completed' : 'In Progress',
                    'Progress Percentage': lp.progressPercentage,
                    'Last Accessed': lp.lastAccessedAt ? new Date(lp.lastAccessedAt).toLocaleDateString() : 'N/A',
                    'Overall Course Progress (%)': enrollment.overallProgressPercentage,
                    'Course Completed': enrollment.status === 'completed' ? 'Yes' : 'No',
                });
            }
        } else {
            // If no specific lesson progress, still list the course
            progressData.push({
                'Course Title': enrollment.course.title,
                'Lesson Title': 'N/A (No lessons started or course has no lessons)',
                'Status': 'N/A',
                'Progress Percentage': 'N/A',
                'Last Accessed': 'N/A',
                'Overall Course Progress (%)': enrollment.overallProgressPercentage,
                'Course Completed': enrollment.status === 'completed' ? 'Yes' : 'No',
            });
        }
    }

    if (progressData.length === 0) {
        // This might happen if enrolled courses have no lessons or no progress tracked yet in a way that populates here
        return res.status(404).json({ message: 'No progress data available to export.' });
    }

    try {
        const { Parser } = require('json2csv');
        const fields = [
            'Course Title',
            'Lesson Title',
            'Status',
            'Progress Percentage',
            'Last Accessed',
            'Overall Course Progress (%)',
            'Course Completed'
        ];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(progressData);

        res.header('Content-Type', 'text/csv');
        res.attachment('my_progress.csv');
        res.status(200).send(csv);
    } catch (err) {
        console.error('Error generating CSV for progress export:', err);
        res.status(500).json({ message: 'Failed to export progress data.' });
    }
});
