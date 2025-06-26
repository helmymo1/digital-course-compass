const User = require('../models/User');
const Course = require('../models/Course');
const asyncHandler = require('express-async-handler');

// @desc    Add or remove a course from user's wishlist (toggle)
// @route   POST /api/wishlist
// @access  Private
exports.toggleWishlistCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id; // From auth middleware

  if (!courseId) {
    return res.status(400).json({ message: 'Course ID is required.' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ message: 'Course not found.' });
  }

  const courseObjectId = course._id; // Ensure it's an ObjectId if working with Mongoose ObjectIds

  // Check if the course is already in the wishlist
  const courseIndex = user.wishlist.findIndex(item => item.equals(courseObjectId));

  let updatedWishlist;
  let message;

  if (courseIndex > -1) {
    // Course is in wishlist, remove it
    user.wishlist.splice(courseIndex, 1);
    message = 'Course removed from wishlist.';
  } else {
    // Course is not in wishlist, add it
    user.wishlist.push(courseObjectId);
    message = 'Course added to wishlist.';
  }

  updatedWishlist = await user.save();

  res.status(200).json({
    success: true,
    message,
    wishlist: updatedWishlist.wishlist, // Send back the updated list of course IDs
  });
});


// @desc    Get user's wishlist
// @route   GET /api/wishlist/:userId
// @access  Private (Self or Admin) - Controller should check permissions
exports.getUserWishlist = asyncHandler(async (req, res) => {
  const requestedUserId = req.params.userId;
  const currentUserId = req.user.id; // Logged-in user
  const currentUserRoles = req.user.roles; // Logged-in user's roles

  // Check if the logged-in user is requesting their own wishlist or is an Admin
  if (requestedUserId !== currentUserId && !currentUserRoles.includes('Admin')) {
    return res.status(403).json({ message: 'Not authorized to view this wishlist.' });
  }

  const user = await User.findById(requestedUserId).populate({
    path: 'wishlist', // Field name in User model
    model: 'Course',  // Explicitly state model name if not automatically inferred or if issues
    select: 'title instructor price averageRating level image category students estimatedDurationHours', // Select fields to return
    populate: {
        path: 'instructor',
        select: 'name' // Populate instructor's name from the User model
    }
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.status(200).json({
    success: true,
    count: user.wishlist.length,
    data: user.wishlist,
  });
});
