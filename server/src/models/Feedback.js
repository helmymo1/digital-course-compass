const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  feedbackType: { type: String, enum: ['general', 'bug_report', 'feature_request', 'support'], default: 'general' },
  subject: { type: String, trim: true },
  message: { type: String, required: true },
  url: { type: String }, // Page URL where feedback was submitted, if applicable
  status: { type: String, enum: ['new', 'seen', 'in-progress', 'resolved', 'wont-fix'], default: 'new' },
  // assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin handling it
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
