const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true }, // Optional, if post is course-specific
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', index: true }, // Optional, if post is lesson-specific
  parentPost: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumPost', index: true }, // For replies
  title: { type: String, trim: true }, // For top-level posts
  content: { type: String, required: true },
  upvotes: { type: Number, default: 0 },
  // downvotes: { type: Number, default: 0 },
  // views: { type: Number, default: 0 }
}, { timestamps: true });

const ForumPost = mongoose.model('ForumPost', forumPostSchema);
module.exports = ForumPost;
