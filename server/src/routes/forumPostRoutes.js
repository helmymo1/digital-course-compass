const express = require('express');
const router = express.Router();
const {
    createForumPost,
    getForumPosts,
    getForumPostById,
    updateForumPost,
    deleteForumPost,
    voteForumPost
} = require('../controllers/forumPostController');
const { protect, checkRole } = require('../middleware/authMiddleware');

// Create a new forum post or reply
router.post('/', protect, createForumPost);

// Get forum posts (can be filtered by course, lesson, parentPost via query params)
router.get('/', getForumPosts); // Should be public or semi-public based on context

// Operations on a specific forum post
router.route('/:postId')
    .get(getForumPostById) // Public or semi-public
    .put(protect, updateForumPost) // Owner or Admin/Moderator
    .delete(protect, deleteForumPost); // Owner or Admin/Moderator

// Vote on a forum post
router.post('/:postId/vote', protect, voteForumPost);

module.exports = router;

// This router should be mounted in server/src/index.js:
// const forumPostRoutes = require('./routes/forumPostRoutes');
// app.use('/api/v1/forum-posts', forumPostRoutes);
