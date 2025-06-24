const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('express-async-handler');

// @desc    Log a user activity
// @route   POST /api/v1/activity/log
// @access  Private (requires authenticated user)
exports.logActivity = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Assuming user ID is available from auth middleware
    const {
        activityType,
        course, // Optional: ObjectId of the course
        lesson, // Optional: ObjectId of the lesson
        pageUrl, // Optional: String URL of the page viewed
        startTime, // Optional: For activities with a duration that might be logged after completion
        endTime, // Optional
        durationSeconds, // Optional: Number of seconds
        details // Optional: Mixed type for any additional JSON data
    } = req.body;

    if (!activityType) {
        res.status(400);
        throw new Error('Activity type is required');
    }

    // Basic validation for activity types if needed
    const validActivityTypes = ['login', 'logout', 'view_course', 'start_lesson', 'complete_lesson', 'view_page', 'post_forum', 'view_video_segment'];
    if (!validActivityTypes.includes(activityType)) {
        // Optional: either error out or log with a warning, or allow any string
        // For now, let's be flexible but one might want to enforce enum values from the model here too.
    }

    let calculatedDuration = durationSeconds;
    if (startTime && endTime && durationSeconds === undefined) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        if (end > start) {
            calculatedDuration = Math.round((end - start) / 1000);
        }
    }


    const activity = await ActivityLog.create({
        user: userId,
        activityType,
        course,
        lesson,
        pageUrl,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        durationSeconds: calculatedDuration,
        ipAddress: req.ip, // Express req.ip, ensure trust proxy is set if behind one
        userAgent: req.headers['user-agent'],
        details
    });

    res.status(201).json({
        success: true,
        data: activity
    });
});

// @desc    Get activity logs (for admin/analytics purposes)
// @route   GET /api/v1/activity/logs
// @access  Private/Admin (or other roles with specific permissions)
exports.getActivityLogs = asyncHandler(async (req, res) => {
    // Basic query parameters (extend as needed for filtering)
    const { userId, activityType, courseId, lessonId, page, limit = 20 } = req.query;
    const query = {};

    if (userId) query.user = userId;
    if (activityType) query.activityType = activityType;
    if (courseId) query.course = courseId;
    if (lessonId) query.lesson = lessonId;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const logs = await ActivityLog.find(query)
        .populate('user', 'name email')
        .populate('course', 'title')
        .populate('lesson', 'title')
        .sort({ createdAt: -1 }) // Latest first
        .skip(skip)
        .limit(limitNum);

    const totalLogs = await ActivityLog.countDocuments(query);

    res.status(200).json({
        success: true,
        count: logs.length,
        total: totalLogs,
        totalPages: Math.ceil(totalLogs / limitNum),
        currentPage: pageNum,
        data: logs
    });
});
