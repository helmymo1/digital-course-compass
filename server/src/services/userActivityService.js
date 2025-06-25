const User = require('../models/User');
const badgeService = require('./badgeService'); // Added badgeService

/**
 * Updates the user's learning streak based on their activity.
 * @param {String} userId - The ID of the user.
 */
async function updateStreak(userId) {
    if (!userId) {
        console.error('updateStreak: userId is required');
        return;
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            console.error(`updateStreak: User not found for ID: ${userId}`);
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to the beginning of the day

        let lastActivity = user.lastActivityDate;
        if (lastActivity) {
            lastActivity = new Date(lastActivity); // Ensure it's a Date object
            lastActivity.setHours(0, 0, 0, 0); // Normalize
        }

        if (lastActivity) {
            const diffTime = today.getTime() - lastActivity.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                // Consecutive day
                user.currentStreak += 1;
            } else if (diffDays > 1) {
                // Streak broken
                user.currentStreak = 1; // Reset to 1 for today's activity
            }
            // If diffDays === 0 (same day) or diffDays < 0 (should not happen if time is synced), currentStreak is not changed here.
            // If it's the same day, we only update lastActivityDate if it's not already today.
        } else {
            // First activity recorded
            user.currentStreak = 1;
        }

        // Update lastActivityDate to today if it's a new activity day or the first activity.
        // This ensures if they perform multiple actions on the same day, it doesn't increment streak multiple times.
        // And if they break a streak, today counts as the first day of a new streak.
        if (!lastActivity || lastActivity.getTime() !== today.getTime()) {
             user.lastActivityDate = today;
        }


        if (user.currentStreak > user.longestStreak) {
            user.longestStreak = user.currentStreak;
        }

        // If lastActivity was null or not today, then we have made a change by setting currentStreak to 1 and updating lastActivityDate.
        // If lastActivity was yesterday, we incremented currentStreak and updated lastActivityDate.
        // If lastActivity was older than yesterday, we reset currentStreak to 1 and updated lastActivityDate.
        // If lastActivity was today, currentStreak is unchanged by the logic above, and lastActivityDate is already today.
        // We only save if there's a meaningful change to streak fields or lastActivityDate.
        if (user.isModified('currentStreak') || user.isModified('longestStreak') || user.isModified('lastActivityDate')) {
            await user.save();
            console.log(`Streak updated for user ${userId}: Current ${user.currentStreak}, Longest ${user.longestStreak}`);

            // After streak is updated and saved, check for streak-related badges
            // Fire-and-forget, don't slow down the primary operation
            badgeService.checkAndAwardBadges(userId, 'STREAK_UPDATED', { currentStreak: user.currentStreak })
                .catch(err => console.error(`Badge check failed for STREAK_UPDATED for user ${userId}:`, err));
        }

    } catch (error) {
        console.error(`Error updating streak for user ${userId}:`, error);
    }
}

module.exports = {
    updateStreak,
};
