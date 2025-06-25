const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for enrollment.'],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required for enrollment.'],
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: {
        values: ['pending_payment', 'active', 'completed', 'cancelled'],
        message: 'Enrollment status "{VALUE}" is not valid.'
    },
    default: 'pending_payment',
  },
  paymentId: {
    type: String,
    trim: true, // Added trim
  },
  overallProgressPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Progress percentage cannot be less than 0.'],
    max: [100, 'Progress percentage cannot be more than 100.'],
  },
  completedAt: {
    type: Date,
  },
  deletedAt: {
    type: Date,
    default: null,
    index: true,
  },
}, { timestamps: true });

// Index for soft delete, if not already covered by other indexes effectively
// enrollmentSchema.index({ deletedAt: 1 }); // This specific index might be redundant if queries usually include user/course

// Ensure a user cannot have multiple active/pending_payment enrollments for the same course if not soft-deleted
enrollmentSchema.index(
    { user: 1, course: 1, status: 1, deletedAt: 1 },
    {
        unique: true,
        partialFilterExpression: {
            status: { $in: ['active', 'pending_payment'] },
            deletedAt: null
        }
    }
);

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
