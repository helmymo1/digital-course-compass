const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Assuming auth middleware

// ======== Public Routes (or routes with minimal protection) ========

// GET /api/content - List all published or generally available content (adjust as needed)
// For a public listing, filtering might be done in the controller or here
router.get('/', contentController.listContent); // May need specific filtering for public view

// GET /api/content/:identifier - Get a single content item by ID or slug
// This could be public for published content
router.get('/:identifier', contentController.getContentByIdOrSlug);


// ======== Protected Routes (require authentication) ========
// Most content creation and modification actions will require a user to be logged in.

// POST /api/content - Create new content (e.g., as a draft)
// Users who can create content (e.g., 'author', 'editor', 'admin')
router.post(
    '/',
    protect, // Ensure user is logged in
    authorize(['author', 'editor', 'admin']), // Ensure user has one of these roles
    contentController.createContent
);

// PUT /api/content/:id - Update existing content
// Users who can update THEIR OWN content or ANY content (e.g., 'editor', 'admin')
// More granular control might be needed in the controller (e.g., author can only edit their drafts)
router.put(
    '/:id',
    protect,
    authorize(['author', 'editor', 'admin']), // Role check, specific ownership check in controller if needed
    contentController.updateContent
);

// DELETE /api/content/:id - Delete (archive) content
// Users who can delete content (e.g., 'editor', 'admin')
router.delete(
    '/:id',
    protect,
    authorize(['editor', 'admin']),
    contentController.deleteContent
);

// POST /api/content/:id/revert/:versionNumber - Revert content to a specific version
router.post(
    '/:id/revert/:versionNumber',
    protect,
    authorize(['editor', 'admin']), // Or authors for their own content
    contentController.revertToVersion
);


// ======== Admin/Editor Routes (require specific higher-level roles) ========

// PATCH /api/content/:id/approve - Approve content
router.patch(
    '/:id/approve',
    protect,
    authorize(['editor', 'admin']), // Only editors or admins can approve
    contentController.approveContent
);

// PATCH /api/content/:id/schedule - Schedule content for publishing
router.patch(
    '/:id/schedule',
    protect,
    authorize(['editor', 'admin']), // Only editors or admins can schedule
    contentController.scheduleContent
);

// PATCH /api/content/:id/publish - Manually publish content
// This might also be used by a cron job internally, or by admins.
router.patch(
    '/:id/publish',
    protect,
    authorize(['editor', 'admin']), // Or a specific 'publisher' role
    contentController.publishContent
);


// ======== Bulk Operation Routes ========
router.post(
    '/bulk/status',
    protect,
    authorize(['admin', 'editor']),
    contentController.bulkUpdateStatus
);

router.post(
    '/bulk/delete',
    protect,
    authorize(['admin', 'editor']),
    contentController.bulkDeleteContent
);

module.exports = router;
