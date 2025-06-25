const mongoose = require('mongoose');

const searchAnalyticsSchema = new mongoose.Schema({
    query: { // The raw search string, if any
        type: String,
        trim: true,
        index: true, // Index for faster searching of popular queries
    },
    userId: { // Optional: if the search was performed by a logged-in user
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    filtersApplied: { // Store the specific filters used in this search
        type: mongoose.Schema.Types.Mixed, // Allows for flexible filter structures
        // Example: { category: 'Programming', level: 'Beginner', minRating: 4 }
    },
    resultsCount: { // Number of courses returned for this query/filter combination
        type: Number,
        required: true,
        min: 0,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true, // Index for time-based analytics
    },
    // Consider adding:
    // userAgent: String, // To understand device/browser
    // ipAddress: String, // For geo-location insights (ensure privacy compliance)
    // page: Number, // If pagination was involved in the search
}, { timestamps: false }); // Explicitly false as we have a custom timestamp

// Compound index for common admin queries, e.g., popular queries with certain filters
searchAnalyticsSchema.index({ query: 1, 'filtersApplied.category': 1, 'filtersApplied.level': 1 });

const SearchAnalytics = mongoose.model('SearchAnalytics', searchAnalyticsSchema);

module.exports = SearchAnalytics;
