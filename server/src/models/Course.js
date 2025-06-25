const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required'],
  },
  category: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative'],
  },
  // enrollments array removed, use Enrollment collection
  // ratings array removed, use CourseRating collection
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  level: { // Added level
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'All Levels',
  },
  estimatedDurationHours: { // Added estimatedDurationHours
    type: Number,
    min: [0, 'Duration cannot be negative'],
  },
  enrollmentCount: { // Added enrollmentCount
    type: Number,
    default: 0,
    min: 0,
  },
  // Consider adding:
  // moduleOrder: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }]
  // thumbnailUrl: { type: String }
  // tags: [String]
}, { timestamps: true }); // `timestamps: true` will add `createdAt` and `updatedAt` fields

// Index fields for better query performance
courseSchema.index({ title: 'text', description: 'text' }); // For text search
courseSchema.index({ category: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ price: 1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
