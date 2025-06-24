const mongoose = require('mongoose');

const courseRatingSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, trim: true },
}, { timestamps: true }); // createdAt will be reviewedAt

courseRatingSchema.index({ course: 1, user: 1 }, { unique: true }); // User can rate a course once

const CourseRating = mongoose.model('CourseRating', courseRatingSchema);
module.exports = CourseRating;
