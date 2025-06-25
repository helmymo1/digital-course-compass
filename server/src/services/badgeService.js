const User = require('../models/User');
const Badge = require('../models/Badge');
const Enrollment = require('../models/Enrollment');
const StudentProgress = require('../models/StudentProgress'); // May be needed for some badge criteria

// Helper function to check if user already has a badge
function userHasBadge(user, badgeId) {
    return user.badgesEarned.some(earnedBadge => earnedBadge.badge.equals(badgeId));
}

/**
 * Checks all applicable badges and awards them to the user if criteria are met.
 * @param {String} userId - The ID of the user.
 * @param {String} eventType - The type of event that triggered this check (e.g., 'COURSE_COMPLETED', 'STREAK_UPDATED').
 * @param {Object} eventDetails - Details specific to the event (e.g., { courseId: '...' }, { currentStreak: 10 }).
 */
async function checkAndAwardBadges(userId, eventType, eventDetails = {}) {
    if (!userId || !eventType) {
        console.error('checkAndAwardBadges: userId and eventType are required.');
        return;
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            console.error(`checkAndAwardBadges: User not found for ID: ${userId}`);
            return;
        }

        const badges = await Badge.find({ isEnabled: true });
        let awardedNewBadge = false;

        for (const badge of badges) {
            if (userHasBadge(user, badge._id)) {
                continue; // User already has this badge
            }

            let criteriaMet = false;
            switch (badge.criteriaType) {
                case 'COURSE_COMPLETION':
                    if (eventType === 'COURSE_COMPLETED' &&
                        badge.criteriaDetails.courseId &&
                        eventDetails.courseId &&
                        badge.criteriaDetails.courseId.toString() === eventDetails.courseId.toString()) {
                        criteriaMet = true;
                    }
                    break;

                case 'STREAK_ACHIEVED':
                    if (eventType === 'STREAK_UPDATED' &&
                        badge.criteriaDetails.days &&
                        eventDetails.currentStreak >= badge.criteriaDetails.days) {
                        criteriaMet = true;
                    }
                    break;

                case 'MULTI_COURSE_COMPLETION':
                    if (eventType === 'COURSE_COMPLETED') { // Check on every course completion
                        const requiredCount = badge.criteriaDetails.numberOfCourses;
                        if (requiredCount) {
                            const completedCoursesCount = await Enrollment.countDocuments({
                                user: userId,
                                status: 'completed'
                            });
                            if (completedCoursesCount >= requiredCount) {
                                criteriaMet = true;
                            }
                        }
                    }
                    break;

                // Add more cases here for other criteriaTypes like:
                // 'PROFILE_COMPLETION', 'FIRST_COMMENT', 'X_QUIZZES_PASSED' etc.
                // These would require different eventTypes and eventDetails structures.

                default:
                    // Unknown or unhandled criteria type
                    break;
            }

            if (criteriaMet) {
                user.badgesEarned.push({ badge: badge._id });
                awardedNewBadge = true;
                console.log(`Badge "${badge.name}" awarded to user ${userId}.`);
                // Optionally, send a notification to the user here
            }
        }

        if (awardedNewBadge) {
            await user.save();
        }

    } catch (error) {
        console.error(`Error in checkAndAwardBadges for user ${userId}, event ${eventType}:`, error);
    }
}

module.exports = {
    checkAndAwardBadges,
};
