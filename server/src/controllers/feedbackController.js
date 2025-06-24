const Feedback = require('../models/Feedback');
const asyncHandler = require('express-async-handler');

// @desc    Submit new feedback
// @route   POST /api/v1/feedback
// @access  Private (Authenticated User)
exports.submitFeedback = asyncHandler(async (req, res) => {
    const { feedbackType, subject, message, url } = req.body;
    const userId = req.user._id;

    if (!message) {
        res.status(400);
        throw new Error('Feedback message is required.');
    }
    if (feedbackType && !['general', 'bug_report', 'feature_request', 'support'].includes(feedbackType)) {
        res.status(400);
        throw new Error('Invalid feedback type.');
    }


    const feedback = new Feedback({
        user: userId,
        feedbackType: feedbackType || 'general',
        subject: subject || '',
        message,
        url: url || '',
        // status is 'new' by default from model
        // priority is 'medium' by default from model
    });

    const createdFeedback = await feedback.save();
    res.status(201).json(createdFeedback);
});

// @desc    Get all feedback entries (for Admins)
// @route   GET /api/v1/feedback
// @access  Private/Admin
exports.getAllFeedback = asyncHandler(async (req, res) => {
    // Add pagination and filtering options as needed
    const { status, feedbackType, priority, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (feedbackType) query.feedbackType = feedbackType;
    if (priority) query.priority = priority;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const feedbackEntries = await Feedback.find(query)
        .populate('user', 'name email') // Populate user details
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limitNum);

    const totalFeedback = await Feedback.countDocuments(query);

    res.status(200).json({
        success: true,
        count: feedbackEntries.length,
        total: totalFeedback,
        totalPages: Math.ceil(totalFeedback / limitNum),
        currentPage: pageNum,
        data: feedbackEntries
    });
});

// @desc    Get a single feedback entry by ID (for Admins)
// @route   GET /api/v1/feedback/:feedbackId
// @access  Private/Admin
exports.getFeedbackById = asyncHandler(async (req, res) => {
    const feedback = await Feedback.findById(req.params.feedbackId).populate('user', 'name email');

    if (!feedback) {
        res.status(404);
        throw new Error('Feedback entry not found');
    }
    res.status(200).json(feedback);
});


// @desc    Update feedback status or priority (for Admins)
// @route   PUT /api/v1/feedback/:feedbackId
// @access  Private/Admin
exports.updateFeedback = asyncHandler(async (req, res) => {
    const { status, priority, assignedTo } = req.body; // Add assignedTo if you implement that field
    const feedback = await Feedback.findById(req.params.feedbackId);

    if (!feedback) {
        res.status(404);
        throw new Error('Feedback entry not found');
    }

    // Validate status and priority if they are provided
    if (status && !['new', 'seen', 'in-progress', 'resolved', 'wont-fix'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status value.');
    }
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
        res.status(400);
        throw new Error('Invalid priority value.');
    }
    // If assignedTo is implemented, validate it's a valid user ID (Admin/Instructor role perhaps)

    feedback.status = status !== undefined ? status : feedback.status;
    feedback.priority = priority !== undefined ? priority : feedback.priority;
    // feedback.assignedTo = assignedTo !== undefined ? assignedTo : feedback.assignedTo;

    const updatedFeedback = await feedback.save();
    res.status(200).json(updatedFeedback);
});

// @desc    Delete a feedback entry (for Admins)
// @route   DELETE /api/v1/feedback/:feedbackId
// @access  Private/Admin
exports.deleteFeedback = asyncHandler(async (req, res) => {
    const feedback = await Feedback.findById(req.params.feedbackId);

    if (!feedback) {
        res.status(404);
        throw new Error('Feedback entry not found');
    }

    await feedback.deleteOne();
    res.status(200).json({ message: 'Feedback entry removed' });
});
