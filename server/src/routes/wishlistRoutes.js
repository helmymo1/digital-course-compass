const express = require('express');
const router = express.Router();
const {
  toggleWishlistCourse,
  getUserWishlist,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware'); // Assuming standard auth middleware

// @route   POST /api/wishlist
// @desc    Add or remove a course from the current user's wishlist
// @access  Private
router.post('/', protect, toggleWishlistCourse);

// @route   GET /api/wishlist/:userId
// @desc    Get a specific user's wishlist (own or by Admin)
// @access  Private
router.get('/:userId', protect, getUserWishlist);

// It might be useful to also have a route for the current user to get their own wishlist without specifying ID in URL
// e.g., GET /api/wishlist/me
// router.get('/me', protect, (req, res) => {
//   // Redirect or directly call getUserWishlist with req.user.id
//   req.params.userId = req.user.id;
//   return getUserWishlist(req, res);
// });
// For now, sticking to the plan's specified routes.

module.exports = router;
