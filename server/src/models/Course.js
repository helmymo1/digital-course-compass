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
  enrollments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  }],
  ratings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
    },
    reviewedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, { timestamps: true }); // `timestamps: true` will add `createdAt` and `updatedAt` fields

// Index fields for better query performance
courseSchema.index({ title: 'text', description: 'text' }); // For text search
courseSchema.index({ category: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ price: 1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
