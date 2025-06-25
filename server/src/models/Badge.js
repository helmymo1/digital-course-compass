const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Badge name is required.'],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Badge description is required.'],
        trim: true,
    },
    iconUrl: {
        type: String,
        required: [true, 'Badge icon URL is required.'],
    },
    criteriaType: {
        type: String,
        required: true,
        enum: [
            'COURSE_COMPLETION',    // User completes a specific course
            'STREAK_ACHIEVED',      // User achieves a certain learning streak (e.g., 7 days, 30 days)
            'MULTI_COURSE_COMPLETION', // User completes a certain number of courses
            'PROFILE_COMPLETION',   // User completes their profile to a certain percentage
            'FIRST_COMMENT',        // User posts their first comment in a forum
            'X_QUIZZES_PASSED',     // User passes a certain number of quizzes with a minimum score
        ],
    },
    criteriaDetails: { // Flexible field to store specific criteria values
        type: mongoose.Schema.Types.Mixed,
        required: true,
        // Examples:
        // For COURSE_COMPLETION: { courseId: 'mongoose.Schema.Types.ObjectId' }
        // For STREAK_ACHIEVED: { days: Number } (e.g., 7, 30, 100)
        // For MULTI_COURSE_COMPLETION: { numberOfCourses: Number }
        // For PROFILE_COMPLETION: { percentage: Number } (e.g., 100)
        // For X_QUIZZES_PASSED: { numberOfQuizzes: Number, minScore: Number }
    },
    isEnabled: { // To allow admins to enable/disable badges without deleting
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

// Index for faster querying by criteriaType if needed, though typically we fetch all enabled badges.
badgeSchema.index({ criteriaType: 1, isEnabled: 1 });

const Badge = mongoose.model('Badge', badgeSchema);

module.exports = Badge;
