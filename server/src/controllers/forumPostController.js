const ForumPost = require('../models/ForumPost');
const Course = require('../models/Course'); // Optional, for linking posts to courses
const Lesson = require('../models/Lesson'); // Optional, for linking posts to lessons
const asyncHandler = require('express-async-handler');

// @desc    Create a new forum post (can be top-level or reply)
// @route   POST /api/v1/forum-posts
// @access  Private (Authenticated User)
exports.createForumPost = asyncHandler(async (req, res) => {
    const { title, content, parentPost, course, lesson } = req.body;
    const userId = req.user._id;

    if (!content) {
        res.status(400);
        throw new Error('Content is required for a forum post.');
    }
    if (parentPost && !title) { // Replies don't need a title
        // Title is optional for replies
    } else if (!parentPost && !title) { // Top-level posts need a title
        res.status(400);
        throw new Error('Title is required for a new top-level forum post.');
    }

    // Optional: Validate course and lesson if provided
    if (course && !(await Course.findById(course))) {
        res.status(404); throw new Error('Course not found.');
    }
    if (lesson && !(await Lesson.findById(lesson))) {
        res.status(404); throw new Error('Lesson not found.');
    }
    if (parentPost && !(await ForumPost.findById(parentPost))) {
        res.status(404); throw new Error('Parent post not found for reply.');
    }


    const post = new ForumPost({
        user: userId,
        title: parentPost ? undefined : title, // Title only for top-level posts
        content,
        parentPost: parentPost || undefined,
        course: course || undefined,
        lesson: lesson || undefined,
    });

    const createdPost = await post.save();
    // Populate user info for immediate display if needed by frontend
    await createdPost.populate('user', 'name email');
    res.status(201).json(createdPost);
});

// @desc    Get forum posts (can be filtered)
// @route   GET /api/v1/forum-posts
// @access  Public (or Private based on context)
exports.getForumPosts = asyncHandler(async (req, res) => {
    const { courseId, lessonId, parentPostId, page = 1, limit = 10 } = req.query;
    const query = {};

    if (courseId) query.course = courseId;
    if (lessonId) query.lesson = lessonId;

    if (parentPostId === 'null' || parentPostId === undefined) { // Get top-level posts
        query.parentPost = null;
    } else if (parentPostId) { // Get replies to a specific post
        query.parentPost = parentPostId;
    }
    // If no parentPostId query param, it gets all posts (top-level and replies) unless explicitly filtered.
    // Default to top-level posts if no specific parent is requested.
    // For a typical forum view, you'd fetch top-level threads, then fetch replies for each.


    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const posts = await ForumPost.find(query)
        .populate('user', 'name email') // Populate user details
        .populate('parentPost', 'title') // Populate parent post title if it's a reply
        .populate('course', 'title')     // Populate course title if linked
        .populate('lesson', 'title')     // Populate lesson title if linked
        .sort({ createdAt: -1 }) // Sort by newest first for general feeds, or by upvotes, etc.
        .skip(skip)
        .limit(limitNum);

    const totalPosts = await ForumPost.countDocuments(query);

    res.status(200).json({
        success: true,
        count: posts.length,
        total: totalPosts,
        totalPages: Math.ceil(totalPosts / limitNum),
        currentPage: pageNum,
        data: posts
    });
});

// @desc    Get a single forum post by ID
// @route   GET /api/v1/forum-posts/:postId
// @access  Public (or Private)
exports.getForumPostById = asyncHandler(async (req, res) => {
    const post = await ForumPost.findById(req.params.postId)
        .populate('user', 'name email')
        .populate('parentPost', 'title user') // Also populate user of parent post
        .populate('course', 'title')
        .populate('lesson', 'title');
        // Consider populating replies here or having a separate endpoint for replies

    if (!post) {
        res.status(404);
        throw new Error('Forum post not found');
    }
    res.status(200).json(post);
});

// @desc    Update a forum post (content only)
// @route   PUT /api/v1/forum-posts/:postId
// @access  Private (Owner or Admin/Moderator)
exports.updateForumPost = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const post = await ForumPost.findById(req.params.postId);

    if (!post) {
        res.status(404);
        throw new Error('Forum post not found');
    }

    // Authorization: Only owner or Admin/Moderator can update
    if (!(post.user.equals(req.user._id) || req.user.roles.includes('Admin') || req.user.roles.includes('Moderator'))) {
        res.status(403);
        throw new Error('User not authorized to update this post.');
    }

    if (content) post.content = content;
    // Title updates might be restricted after creation, especially for replies.

    const updatedPost = await post.save();
    await updatedPost.populate('user', 'name email');
    res.status(200).json(updatedPost);
});

// @desc    Delete a forum post
// @route   DELETE /api/v1/forum-posts/:postId
// @access  Private (Owner or Admin/Moderator)
exports.deleteForumPost = asyncHandler(async (req, res) => {
    const post = await ForumPost.findById(req.params.postId);

    if (!post) {
        res.status(404);
        throw new Error('Forum post not found');
    }

    if (!(post.user.equals(req.user._id) || req.user.roles.includes('Admin') || req.user.roles.includes('Moderator'))) {
        res.status(403);
        throw new Error('User not authorized to delete this post.');
    }

    // Consider what happens to replies if a parent post is deleted (e.g., cascade delete, or mark as "deleted user")
    // For simplicity, just deleting the post for now.
    // await ForumPost.deleteMany({ parentPost: post._id }); // Example: delete all replies

    await post.deleteOne();
    res.status(200).json({ message: 'Forum post removed' });
});


// @desc    Upvote/Downvote a forum post (simple toggle)
// @route   POST /api/v1/forum-posts/:postId/vote
// @access  Private (Authenticated User)
exports.voteForumPost = asyncHandler(async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user._id;
    // const { voteType } = req.body; // 'upvote', 'downvote', or can be simplified to just 'upvote'

    const post = await ForumPost.findById(postId);
    if (!post) {
        res.status(404);
        throw new Error('Forum post not found.');
    }

    // This is a very basic upvote system. A real system would track who voted to prevent multiple votes.
    // For simplicity, this just increments/decrements.
    // A better approach: store user IDs in an `upvotedBy` array.
    // If user ID is in array, remove it (unvote). If not, add it (vote).
    // `post.upvotes` would then be `post.upvotedBy.length`.

    // Simple increment for now (can be called multiple times by same user)
    post.upvotes = (post.upvotes || 0) + 1;
    await post.save();

    res.status(200).json({ upvotes: post.upvotes });
});
