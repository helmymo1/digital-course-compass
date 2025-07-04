const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  order: { type: Number, required: true }, // To maintain order within a course
  // lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }] // Populated dynamically or kept here
  deletedAt: { // For soft deletes
    type: Date,
    default: null,
    index: true,
  },
}, { timestamps: true });

moduleSchema.index({ course: 1, order: 1 });
moduleSchema.index({ deletedAt: 1 }); // Index for soft delete

const Module = mongoose.model('Module', moduleSchema);
module.exports = Module;
