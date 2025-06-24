const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String },
  courses: [{
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    order: { type: Number, required: true }
  }],
  targetAudience: { type: String }, // e.g., 'Beginner', 'Advanced Developer'
  // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin or Instructor
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const LearningPath = mongoose.model('LearningPath', learningPathSchema);
module.exports = LearningPath;
