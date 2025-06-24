const mongoose = require('mongoose');

const userLearningPathSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    learningPath: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningPath', required: true },
    status: { type: String, enum: ['not-started', 'in-progress', 'completed'], default: 'not-started' },
    startedAt: { type: Date },
    completedAt: { type: Date },
    // progressPercentage: { type: Number, min:0, max:100, default: 0 } // Could be calculated based on course completion within the path
}, { timestamps: true });

userLearningPathSchema.index({ user: 1, learningPath: 1 }, { unique: true });

const UserLearningPath = mongoose.model('UserLearningPath', userLearningPathSchema);
module.exports = UserLearningPath;
