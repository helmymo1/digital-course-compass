const Payment = require('../models/Payment');
const UserSubscription = require('../models/UserSubscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const ActivityLog = require('../models/ActivityLog');
const CourseRating = require('../models/CourseRating');
const ForumPost = require('../models/ForumPost'); // Added
const StudentProgress = require('../models/StudentProgress'); // Added
const Lesson = require('../models/Lesson'); // Added
const SearchAnalytics = require('../models/SearchAnalytics'); // Added for search analytics
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');

// @desc    Get basic revenue analytics
// @route   GET /api/v1/admin/analytics/revenue-summary
// @access  Private/Admin
exports.getRevenueSummary = asyncHandler(async (req, res) => {
    try {
        const { startDate: queryStartDate, endDate: queryEndDate } = req.query;
        let defaultDays = 30;
        if (queryStartDate && queryEndDate) defaultDays = null;

        let startDate, endDate;
        if (queryStartDate && queryEndDate) {
            startDate = new Date(queryStartDate);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(queryEndDate);
            endDate.setHours(23, 59, 59, 999);
        } else {
            const daysQuery = parseInt(req.query.days, 10);
            const periodDays = (daysQuery && daysQuery > 0 && daysQuery <= 730) ? daysQuery : defaultDays;
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(startDate.getDate() - periodDays);
            startDate.setHours(0, 0, 0, 0);
        }

        const periodInDaysForLabel = defaultDays ? defaultDays : Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        const totalRevenueResult = await Payment.aggregate([
            { $match: { paymentStatus: 'succeeded' } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;
        const totalSuccessfulPayments = totalRevenueResult.length > 0 ? totalRevenueResult[0].count : 0;

        const revenueInPeriodResult = await Payment.aggregate([
            { $match: { paymentStatus: 'succeeded', createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);
        const revenueInPeriod = revenueInPeriodResult.length > 0 ? revenueInPeriodResult[0].total : 0;
        const successfulPaymentsInPeriod = revenueInPeriodResult.length > 0 ? revenueInPeriodResult[0].count : 0;

        const revenueByGatewayInPeriod = await Payment.aggregate([
            { $match: { paymentStatus: 'succeeded', createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: '$paymentGateway', total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        const revenueByPlanInPeriod = await Payment.aggregate([
            { $match: { paymentStatus: 'succeeded', subscription: { $ne: null }, createdAt: { $gte: startDate, $lte: endDate } }},
            { $lookup: { from: UserSubscription.collection.name, localField: 'subscription', foreignField: '_id', as: 'userSubscriptionInfo' }},
            { $unwind: '$userSubscriptionInfo' },
            { $lookup: { from: SubscriptionPlan.collection.name, localField: 'userSubscriptionInfo.plan', foreignField: '_id', as: 'planInfo' }},
            { $unwind: '$planInfo' },
            { $group: { _id: '$planInfo.name', total: { $sum: '$amount' }, count: { $sum: 1 } }},
            { $sort: { total: -1 } }
        ]);

        const newSubscriptionsInPeriod = await UserSubscription.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
        const activeSubscriptionsCount = await UserSubscription.countDocuments({ status: { $in: ['active', 'trialing'] } });

        res.status(200).json({
            success: true,
            summary: {
                overallTotalRevenue: parseFloat(totalRevenue.toFixed(2)),
                totalSuccessfulPayments,
                period: {
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    daysForLabel: periodInDaysForLabel,
                    revenueInPeriod: parseFloat(revenueInPeriod.toFixed(2)),
                    successfulPaymentsInPeriod,
                    revenueByGatewayInPeriod: revenueByGatewayInPeriod.map(r => ({ gateway: r._id, total: parseFloat(r.total.toFixed(2)), count: r.count })),
                    revenueBySubscriptionPlanInPeriod: revenueByPlanInPeriod.map(r => ({ planName: r._id, total: parseFloat(r.total.toFixed(2)), count: r.count })),
                    newSubscriptionsInPeriod,
                },
                currentActiveSubscriptions: activeSubscriptionsCount,
            }
        });
    } catch (error) {
        console.error('Get Revenue Summary Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching revenue summary.', error: error.message });
    }
});

// @desc    Get course completion rates
// @route   GET /api/v1/admin/analytics/course-completion
// @access  Private/Admin
exports.getCourseCompletionRates = asyncHandler(async (req, res) => {
    const completionData = await Enrollment.aggregate([
        { $match: { status: { $in: ['active', 'completed'] } } },
        { $group: { _id: '$course', totalEnrollments: { $sum: 1 }, completedEnrollments: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
        { $lookup: { from: Course.collection.name, localField: '_id', foreignField: '_id', as: 'courseDetails' } },
        { $unwind: '$courseDetails' },
        { $project: { courseId: '$_id', courseTitle: '$courseDetails.title', totalEnrollments: 1, completedEnrollments: 1, completionRate: { $cond: [ { $eq: ['$totalEnrollments', 0] }, 0, { $multiply: [{ $divide: ['$completedEnrollments', '$totalEnrollments'] }, 100] } ] } } },
        { $sort: { completionRate: -1 } }
    ]);
    res.status(200).json({ success: true, data: completionData });
});

// @desc    Get time spent analytics
// @route   GET /api/v1/admin/analytics/time-spent
// @access  Private/Admin
exports.getTimeSpentAnalytics = asyncHandler(async (req, res) => {
    const { courseId, userId, lessonId, startDate, endDate, groupBy = 'user' } = req.query;
    const matchConditions = {};
    if (courseId) matchConditions.course = new mongoose.Types.ObjectId(courseId);
    if (userId) matchConditions.user = new mongoose.Types.ObjectId(userId);
    if (lessonId) matchConditions.lesson = new mongoose.Types.ObjectId(lessonId);
    if (startDate && endDate) {
        matchConditions.createdAt = { $gte: new Date(startDate), $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) };
    }
    matchConditions.durationSeconds = { $exists: true, $gt: 0 };

    let groupingId;
    let lookupFields = {};
    if (groupBy === 'course') { groupingId = '$course'; lookupFields = { from: Course.collection.name, projectField: '$entityDetailsArr.title' };
    } else if (groupBy === 'lesson') { groupingId = '$lesson'; lookupFields = { from: Lesson.collection.name, projectField: '$entityDetailsArr.title' };
    } else { groupingId = '$user'; lookupFields = { from: 'users', projectField: '$entityDetailsArr.name' }; }

    const aggregationPipeline = [
        { $match: { [groupBy === 'user' ? 'user' : groupBy]: { $ne: null } } },
        { $match: matchConditions },
        { $group: { _id: groupingId, totalDurationSeconds: { $sum: '$durationSeconds' }, activityCount: { $sum: 1 } } },
        { $lookup: { from: lookupFields.from, localField: '_id', foreignField: '_id', as: 'entityDetailsArr' } },
        { $unwind: { path: '$entityDetailsArr', preserveNullAndEmptyArrays: true } },
        { $project: { identifier: '$_id', name: lookupFields.projectField, totalDurationSeconds: 1, totalDurationMinutes: { $round: [{ $divide: ['$totalDurationSeconds', 60] }, 2] }, totalDurationHours: { $round: [{ $divide: ['$totalDurationSeconds', 3600] }, 2] }, activityCount: 1, _id: 0 } },
        { $sort: { totalDurationSeconds: -1 } }
    ];
    const timeSpentData = await ActivityLog.aggregate(aggregationPipeline);
    res.status(200).json({ success: true, groupBy, data: timeSpentData });
});

// @desc    Get course performance metrics
// @route   GET /api/v1/admin/analytics/course-performance
// @access  Private/Admin
exports.getCoursePerformanceMetrics = asyncHandler(async (req, res) => {
    const courseMetrics = await Course.aggregate([
        { $lookup: { from: Enrollment.collection.name, localField: '_id', foreignField: 'course', as: 'enrollmentData' } },
        { $lookup: { from: CourseRating.collection.name, localField: '_id', foreignField: 'course', as: 'ratingData' } },
        { $addFields: { totalEnrollments: { $size: '$enrollmentData' }, completedEnrollments: { $size: { $filter: { input: '$enrollmentData', as: 'enrollment', cond: { $eq: ['$$enrollment.status', 'completed'] } } } }, averageRatingValue: { $avg: '$ratingData.rating' }, numberOfRatings: { $size: '$ratingData' } } },
        { $project: { _id: 1, courseTitle: '$title', totalEnrollments: 1, completedEnrollments: 1, completionRate: { $cond: [ { $eq: ['$totalEnrollments', 0] }, 0, { $multiply: [{ $divide: ['$completedEnrollments', '$totalEnrollments'] }, 100] }] }, averageRating: { $ifNull: ['$averageRatingValue', 0] }, numberOfRatings: 1, } },
        { $sort: { totalEnrollments: -1 } }
    ]);
    res.status(200).json({ success: true, data: courseMetrics });
});

// @desc    Get student engagement metrics
// @route   GET /api/v1/admin/analytics/student-engagement
// @access  Private/Admin
exports.getStudentEngagementMetrics = asyncHandler(async (req, res) => {
    const { timePeriod = '30d' } = req.query;
    let startDate = new Date();
    switch (timePeriod) {
        case '7d': startDate.setDate(startDate.getDate() - 7); break;
        case '90d': startDate.setDate(startDate.getDate() - 90); break;
        case '30d': default: startDate.setDate(startDate.getDate() - 30); break;
    }
    startDate.setHours(0,0,0,0);
    const endDate = new Date();

    const activeUsersResult = await ActivityLog.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$user' } }, { $count: 'count' }
    ]);
    const distinctActiveUsers = activeUsersResult.length > 0 ? activeUsersResult[0].count : 0;

    const newForumPosts = await ForumPost.countDocuments({ parentPost: null, createdAt: { $gte: startDate, $lte: endDate } });
    const newForumReplies = await ForumPost.countDocuments({ parentPost: { $ne: null }, createdAt: { $gte: startDate, $lte: endDate } });

    // Using 'durationSeconds' from any activity log that has it, not just 'logout'
    const avgSessionDurationResult = await ActivityLog.aggregate([
        { $match: { durationSeconds: { $exists: true, $gt: 0 }, createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, avgDuration: { $avg: '$durationSeconds' } } }
    ]);
    const averageSessionDurationSeconds = avgSessionDurationResult.length > 0 ? avgSessionDurationResult[0].avgDuration : 0;

    const lessonInteractions = await ActivityLog.countDocuments({ activityType: { $in: ['start_lesson', 'complete_lesson', 'view_lesson'] }, createdAt: { $gte: startDate, $lte: endDate } });

    res.status(200).json({
        success: true,
        period: { startDate: startDate.toISOString().split('T')[0], endDate: endDate.toISOString().split('T')[0] },
        activeUsers: distinctActiveUsers,
        forumActivity: { newThreads: newForumPosts, newReplies: newForumReplies, totalNewContributions: newForumPosts + newForumReplies },
        averageSessionDurationSeconds: parseFloat(averageSessionDurationSeconds.toFixed(2)),
        lessonInteractions: lessonInteractions,
    });
});

// @desc    Get content analytics (e.g., most viewed lessons, completion rates)
// @route   GET /api/v1/admin/analytics/content-analytics
// @access  Private/Admin
exports.getContentAnalytics = asyncHandler(async (req, res) => {
    const mostViewedLessons = await ActivityLog.aggregate([
        { $match: { activityType: { $in: ['view_lesson', 'start_lesson'] }, lesson: { $ne: null } } },
        { $group: { _id: '$lesson', views: { $sum: 1 } } },
        { $sort: { views: -1 } }, { $limit: 10 },
        { $lookup: { from: Lesson.collection.name, localField: '_id', foreignField: '_id', as: 'lessonDetails' } },
        { $unwind: { path: '$lessonDetails', preserveNullAndEmptyArrays: true } }, // preserve if a lesson was deleted but logs exist
        { $project: { lessonId: '$_id', title: '$lessonDetails.title', views: 1, _id: 0 } }
    ]);

    const lessonCompletionStats = await StudentProgress.aggregate([
        { $match: { lesson: { $ne: null }}},
        { $group: { _id: '$lesson', totalTracked: { $sum: 1 }, totalCompleted: { $sum: { $cond: [ '$completed', 1, 0 ] } } } },
        { $project: { lessonId: '$_id', completionRate: { $cond: [ { $eq: ['$totalTracked', 0] }, 0, { $multiply: [ { $divide: ['$totalCompleted', '$totalTracked'] }, 100 ] } ] }, totalTracked: 1, totalCompleted: 1, _id: 0 } },
        { $sort: { completionRate: -1 } }, { $limit: 20 },
        { $lookup: { from: Lesson.collection.name, localField: 'lessonId', foreignField: '_id', as: 'lessonDetails' } },
        { $unwind: { path: '$lessonDetails', preserveNullAndEmptyArrays: true } }, // preserve if a lesson was deleted
        { $project: { lessonId: 1, title: '$lessonDetails.title', completionRate: 1, totalTracked:1, totalCompleted:1 } }
    ]);

    res.status(200).json({ success: true, mostViewedLessons, lessonCompletionStats });
});

// --- Search Analytics ---

// @desc    Get top search queries
// @route   GET /api/v1/admin/analytics/search/top-queries
// @access  Private/Admin
exports.getTopSearchQueries = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate && endDate) {
        matchStage.timestamp = { $gte: new Date(startDate), $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) };
    }
    matchStage.query = { $ne: null, $ne: "" }; // Only include actual search queries

    const topQueries = await SearchAnalytics.aggregate([
        { $match: matchStage },
        { $group: { _id: { $toLower: '$query' }, count: { $sum: 1 }, latestTimestamp: { $max: '$timestamp' } } }, // Group by lowercase query to consolidate
        { $sort: { count: -1, latestTimestamp: -1 } },
        { $limit: limit },
        { $project: { query: '$_id', count: 1, latestTimestamp: 1, _id: 0 } }
    ]);
    res.status(200).json({ success: true, data: topQueries });
});

// @desc    Get queries with no results
// @route   GET /api/v1/admin/analytics/search/no-result-queries
// @access  Private/Admin
exports.getNoResultQueries = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const { startDate, endDate } = req.query;

    const matchStage = { resultsCount: 0 };
    if (startDate && endDate) {
        matchStage.timestamp = { $gte: new Date(startDate), $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) };
    }
    matchStage.query = { $ne: null, $ne: "" };

    const noResultQueries = await SearchAnalytics.aggregate([
        { $match: matchStage },
        { $group: { _id: { $toLower: '$query' }, count: { $sum: 1 }, latestTimestamp: { $max: '$timestamp' } } },
        { $sort: { count: -1, latestTimestamp: -1 } }, // Show most frequent no-result queries first
        { $limit: limit },
        { $project: { query: '$_id', countOfNoResultOccurrences: '$count', latestTimestamp: 1, _id: 0 } }
    ]);
    res.status(200).json({ success: true, data: noResultQueries });
});

// @desc    Get filter usage statistics
// @route   GET /api/v1/admin/analytics/search/filter-usage
// @access  Private/Admin
exports.getFilterUsage = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const matchStage = { 'filtersApplied': { $exists: true, $ne: {} } }; // Only entries with filters
     if (startDate && endDate) {
        matchStage.timestamp = { $gte: new Date(startDate), $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) };
    }

    // This is a simplified example. True filter usage might require more complex aggregation
    // if you want to count individual filter keys (e.g., how many times 'category' was used vs 'level')
    // For now, let's get counts of common filter combinations or specific known filters.

    // Example: Count usage of 'category' filter
    const categoryFilterUsage = await SearchAnalytics.aggregate([
        { $match: { ...matchStage, 'filtersApplied.category': { $exists: true } } },
        { $group: { _id: '$filtersApplied.category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { category: '$_id', count: 1, _id: 0 } }
    ]);

    // Example: Count usage of 'level' filter
    const levelFilterUsage = await SearchAnalytics.aggregate([
        { $match: { ...matchStage, 'filtersApplied.level': { $exists: true } } },
        { $group: { _id: '$filtersApplied.level', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { level: '$_id', count: 1, _id: 0 } }
    ]);

    // Example: Count usage of 'minRating' filter
    const minRatingFilterUsage = await SearchAnalytics.aggregate([
        { $match: { ...matchStage, 'filtersApplied.minRating': { $exists: true } } },
        { $group: { _id: '$filtersApplied.minRating', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { minRating: '$_id', count: 1, _id: 0 } }
    ]);


    res.status(200).json({
        success: true,
        data: {
            categoryUsage: categoryFilterUsage,
            levelUsage: levelFilterUsage,
            minRatingUsage: minRatingFilterUsage,
            // Add more specific filter usage stats as needed
        }
    });
});
