const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  activityType: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'view_course', 'start_lesson', 'complete_lesson', 'view_page', 'post_forum', 'view_video_segment']
  },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', index: true },
  pageUrl: { type: String }, // For generic page views
  startTime: { type: Date }, // For activities with duration
  endTime: { type: Date },   // For activities with duration
  durationSeconds: { type: Number }, // Calculated duration
  ipAddress: { type: String },
  userAgent: { type: String },
  details: { type: mongoose.Schema.Types.Mixed } // For additional context
}, { timestamps: true }); // `createdAt` will be the primary timestamp for the log entry

activityLogSchema.index({ user: 1, activityType: 1, createdAt: -1 });
activityLogSchema.index({ course: 1, activityType: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
module.exports = ActivityLog;
