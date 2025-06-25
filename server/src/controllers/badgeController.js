const Badge = require('../models/Badge');
const User = require('../models/User'); // To populate earned badge details for a user
const asyncHandler = require('express-async-handler');

// @desc    Get all available badges
// @route   GET /api/v1/badges
// @access  Public (or Private if only for logged-in users)
exports.getAllBadges = asyncHandler(async (req, res) => {
    // Only return enabled badges to the general list
    const badges = await Badge.find({ isEnabled: true }).select('-isEnabled -createdAt -updatedAt -__v');
    res.status(200).json({
        status: 'success',
        count: badges.length,
        data: badges,
    });
});

// @desc    Get a specific badge by ID
// @route   GET /api/v1/badges/:id
// @access  Public (or Private)
exports.getBadgeById = asyncHandler(async (req, res) => {
    const badge = await Badge.findOne({ _id: req.params.id, isEnabled: true }).select('-isEnabled -createdAt -updatedAt -__v');
    if (!badge) {
        res.status(404);
        throw new Error('Badge not found or not enabled.');
    }
    res.status(200).json({
        status: 'success',
        data: badge,
    });
});

// @desc    Get logged-in user's earned badges
// @route   GET /api/v1/users/me/badges
// @access  Private (User)
exports.getMyEarnedBadges = asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
        res.status(401);
        throw new Error('Not authorized. No user data found.');
    }

    const user = await User.findById(req.user.id)
        .populate({
            path: 'badgesEarned.badge',
            select: 'name description iconUrl criteriaType', // Select fields you want from the Badge model
            match: { isEnabled: true } // Only populate badges that are still enabled
        })
        .select('badgesEarned');

    if (!user) {
        res.status(404);
        throw new Error('User not found.');
    }

    // Filter out any null badge entries if a populated badge was not enabled
    const earnedBadges = user.badgesEarned
        .filter(eb => eb.badge)
        .map(eb => ({
            _id: eb.badge._id, // Badge actual ID
            name: eb.badge.name,
            description: eb.badge.description,
            iconUrl: eb.badge.iconUrl,
            criteriaType: eb.badge.criteriaType, // good to know why it was earned
            earnedAt: eb.earnedAt
        }));


    res.status(200).json({
        status: 'success',
        count: earnedBadges.length,
        data: earnedBadges,
    });
});


// --- Admin Only Routes --- //

// @desc    Create a new badge
// @route   POST /api/v1/badges
// @access  Private (Admin)
exports.createBadge = asyncHandler(async (req, res) => {
    const { name, description, iconUrl, criteriaType, criteriaDetails, isEnabled } = req.body;

    if (!name || !description || !iconUrl || !criteriaType || !criteriaDetails) {
        res.status(400);
        throw new Error('Please provide all required fields: name, description, iconUrl, criteriaType, criteriaDetails.');
    }

    const badge = await Badge.create({
        name,
        description,
        iconUrl,
        criteriaType,
        criteriaDetails,
        isEnabled
    });

    res.status(201).json({
        status: 'success',
        data: badge,
    });
});

// @desc    Update a badge
// @route   PUT /api/v1/badges/:id
// @access  Private (Admin)
exports.updateBadge = asyncHandler(async (req, res) => {
    const badge = await Badge.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!badge) {
        res.status(404);
        throw new Error('Badge not found.');
    }

    res.status(200).json({
        status: 'success',
        data: badge,
    });
});

// @desc    Delete a badge
// @route   DELETE /api/v1/badges/:id
// @access  Private (Admin)
// Note: Consider soft delete (e.g., setIsEnabled(false)) instead of hard delete
// if users have already earned these badges and you want to preserve history.
// The current model has isEnabled, so toggling that is preferred.
exports.deleteBadge = asyncHandler(async (req, res) => {
    const badge = await Badge.findById(req.params.id);

    if (!badge) {
        res.status(404);
        throw new Error('Badge not found.');
    }

    // Instead of deleting, consider setting isEnabled to false
    // await badge.remove(); // or badge.deleteOne() in Mongoose 6+
    badge.isEnabled = false;
    await badge.save();


    res.status(200).json({ // 204 No Content if hard delete, 200 if soft delete
        status: 'success',
        message: 'Badge disabled successfully. (Soft delete)',
        data: null
    });
});
