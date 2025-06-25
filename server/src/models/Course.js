const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required.'],
    trim: true,
    minlength: [5, 'Course title must be at least 5 characters long.'],
    maxlength: [150, 'Course title cannot exceed 150 characters.'],
    // Unique constraint handled by partial index below to account for soft deletes
  },
  description: {
    type: String,
    required: [true, 'Course description is required.'],
    trim: true,
    minlength: [20, 'Course description must be at least 20 characters long.'],
    maxlength: [5000, 'Course description cannot exceed 5000 characters.'],
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Course instructor is required.'],
  },
  category: { // Consider making this an enum if categories are predefined
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: {
        values: ['draft', 'published'],
        message: 'Course status "{VALUE}" is not valid.'
    },
    default: 'draft',
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative.'],
  },
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Average rating cannot be negative.'],
    max: [5, 'Average rating cannot exceed 5.'],
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: [0, 'Total ratings cannot be negative.'],
  },
  level: {
    type: String,
    enum: {
        values: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
        message: 'Course level "{VALUE}" is not valid.'
    },
    default: 'All Levels',
  },
  estimatedDurationHours: {
    type: Number,
    min: [0, 'Estimated duration cannot be negative.'],
  },
  enrollmentCount: {
    type: Number,
    default: 0,
    min: [0, 'Enrollment count cannot be negative.'],
  },
  deletedAt: { // For soft deletes (assuming this was added in a previous step)
    type: Date,
    default: null,
    index: true,
  },
  // Consider adding:
  // moduleOrder: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }]
  // thumbnailUrl: { type: String }
  // tags: [String]
}, { timestamps: true });

// Index fields for better query performance
// Ensure existing indexes are compatible or updated if necessary
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ price: 1 });
// courseSchema.index({ deletedAt: 1 }); // This was added in a previous step for soft delete

// Partial unique index for title (allows multiple nulls in deletedAt, but unique title if deletedAt is null)
courseSchema.index({ title: 1, deletedAt: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
