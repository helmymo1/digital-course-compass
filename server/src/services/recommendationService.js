const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User'); // If needed for user-based recommendations
const mongoose = require('mongoose');

/**
 * Recommends courses based on users who enrolled in the current course.
 * @param {String} currentCourseId - The ID of the course for which to find recommendations.
 * @param {String} [excludeUserId] - Optional. User ID to exclude their own already enrolled courses if providing personalized recs.
 * @param {Number} [limit=5] - Max number of recommendations to return.
 * @returns {Array<Course>} - An array of recommended course objects.
 */
async function getRecommendationsBasedOnCourseEnrollments(currentCourseId, excludeUserId = null, limit = 5) {
    try {
        // Find users who are enrolled in the currentCourseId
        const enrollmentsInCurrentCourse = await Enrollment.find({
            course: currentCourseId,
            status: { $in: ['active', 'completed'] } // Consider only active/completed enrollments
        }).select('user');

        if (enrollmentsInCurrentCourse.length === 0) {
            return []; // No users enrolled, so no basis for this type of recommendation
        }

        const userIds = enrollmentsInCurrentCourse.map(e => e.user);

        // Find other courses these users are also enrolled in
        const otherEnrollments = await Enrollment.aggregate([
            { $match: {
                user: { $in: userIds },
                course: { $ne: new mongoose.Types.ObjectId(currentCourseId) }, // Exclude the current course itself
                status: { $in: ['active', 'completed'] }
            }},
            { $group: {
                _id: '$course', // Group by courseId
                enrollmentCountInThisSet: { $sum: 1 } // Count how many of these users are enrolled in each other course
            }},
            { $sort: { enrollmentCountInThisSet: -1 } }, // Sort by most commonly co-enrolled
            { $limit: limit + 5 }, // Fetch a bit more to allow for filtering already enrolled courses by excludeUserId
            { $lookup: {
                from: 'courses', // The actual name of the courses collection
                localField: '_id',
                foreignField: '_id',
                as: 'courseDetails'
            }},
            { $unwind: '$courseDetails' },
            { $match: { 'courseDetails.status': 'published' } }, // Only recommend published courses
            { $replaceRoot: { newRoot: '$courseDetails' } } // Make the course document the root
        ]);

        if (!excludeUserId) {
            return otherEnrollments.slice(0, limit);
        }

        // If excludeUserId is provided, filter out courses they are already enrolled in
        const userAlreadyEnrolledCourseIds = (await Enrollment.find({ user: excludeUserId, status: { $in: ['active', 'completed']}}).select('course')).map(e => e.course.toString());

        const filteredRecommendations = otherEnrollments.filter(course => !userAlreadyEnrolledCourseIds.includes(course._id.toString()));

        return filteredRecommendations.slice(0, limit);

    } catch (error) {
        console.error('Error in getRecommendationsBasedOnCourseEnrollments:', error);
        return []; // Return empty on error
    }
}


/**
 * Recommends courses based on the categories of courses a user is already enrolled in.
 * @param {String} userId - The ID of the user for whom to generate recommendations.
 * @param {Number} [limit=5] - Max number of recommendations to return.
 * @returns {Array<Course>} - An array of recommended course objects.
 */
async function getRecommendationsBasedOnUserCategories(userId, limit = 5) {
    try {
        const userEnrollments = await Enrollment.find({
            user: userId,
            status: { $in: ['active', 'completed'] }
        }).populate({
            path: 'course',
            select: 'category _id' // Only need category and _id to exclude
        });

        if (userEnrollments.length === 0) {
            return []; // No enrollments, no category preference known
        }

        const enrolledCourseIds = userEnrollments.map(e => e.course._id);
        const userCategories = [...new Set(userEnrollments.map(e => e.course.category).filter(Boolean))];

        if (userCategories.length === 0) {
            return []; // No categories found from enrollments
        }

        // Find other published courses in these categories, excluding already enrolled ones
        const recommendedCourses = await Course.find({
            category: { $in: userCategories },
            status: 'published',
            _id: { $nin: enrolledCourseIds } // Exclude courses user is already in
        })
        .sort({ averageRating: -1, enrollmentCount: -1 }) // Prioritize highly rated and popular
        .limit(limit)
        .select('-description'); // Exclude description for brevity in recommendations

        return recommendedCourses;

    } catch (error) {
        console.error('Error in getRecommendationsBasedOnUserCategories:', error);
        return [];
    }
}

module.exports = {
    getRecommendationsBasedOnCourseEnrollments,
    getRecommendationsBasedOnUserCategories,
};
