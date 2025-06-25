const mongoose = require('mongoose');

const studentProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    progressPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Compound unique index to prevent duplicate progress entries for the same lesson by the same user
studentProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

// Index for querying all progress within a course for a user efficiently
studentProgressSchema.index({ user: 1, course: 1 });

// Update lastAccessedAt on save, particularly for updates
studentProgressSchema.pre('save', function(next) {
  if (this.isModified()) { // only update if actual fields are modified, not just on initial creation via default
    this.lastAccessedAt = Date.now();
  }
  next();
});


const StudentProgress = mongoose.model('StudentProgress', studentProgressSchema);

module.exports = StudentProgress;
