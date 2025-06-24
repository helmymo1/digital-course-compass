const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
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
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending_payment', 'active', 'completed', 'cancelled'],
    default: 'pending_payment',
  },
  paymentId: { // To store Stripe Payment Intent ID or Charge ID
    type: String,
  },
  // Mongoose automatically adds createdAt and updatedAt if timestamps is true
}, { timestamps: true });

// Ensure a user cannot be enrolled in the same course multiple times with an active or pending status
enrollmentSchema.index({ user: 1, course: 1, status: 1 }, { unique: true, partialFilterExpression: { status: { $in: ['active', 'pending_payment'] } } });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
