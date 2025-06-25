const express = require('express');
const badgeController = require('../controllers/badgeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes (or at least for any logged-in user)
router.get('/', badgeController.getAllBadges);
router.get('/:id', badgeController.getBadgeById);

// Routes for specific user's earned badges (already in userRoutes.js as /users/me/badges)
// No, it's better to have it here for consistency if we are creating a badge controller.
// Let's add it to userRoutes.js as per plan, and perhaps reconsider if this is the best place.
// For now, the plan says "Create API endpoint(s) to list available badges and user's earned badges."
// This implies a general badge listing and a user-specific one.

// The user-specific one is /api/v1/users/me/badges as defined in the controller.
// So that route definition will go into userRoutes.js.

// Admin routes for managing badges
router.post(
    '/',
    authMiddleware.protect,
    authMiddleware.checkRole(['Admin']),
    badgeController.createBadge
);

router.put(
    '/:id',
    authMiddleware.protect,
    authMiddleware.checkRole(['Admin']),
    badgeController.updateBadge
);

router.delete(
    '/:id',
    authMiddleware.protect,
    authMiddleware.checkRole(['Admin']),
    badgeController.deleteBadge
);

module.exports = router;
