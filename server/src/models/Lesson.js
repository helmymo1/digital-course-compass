const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true }, // Denormalized for easier querying
  title: { type: String, required: true, trim: true },
  lessonType: { type: String, enum: ['video', 'text', 'quiz', 'assignment'], required: true },
  content: { type: String }, // For text content or description
  videoUrl: { type: String }, // For video lessons
  duration: { type: Number, default: 0 }, // Duration in seconds (for videos or estimated reading time)
  order: { type: Number, required: true }, // To maintain order within a module
  // quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' } // If lessonType is 'quiz'
  // assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' } // If lessonType is 'assignment'
}, { timestamps: true });

lessonSchema.index({ module: 1, order: 1 });
lessonSchema.index({ course: 1 }); // For querying all lessons in a course

const Lesson = mongoose.model('Lesson', lessonSchema);
module.exports = Lesson;
