const express = require('express');
const router = express.Router();
const {
  getLmsStatus,
  syncCoursesToLms,
  pullGradesFromLms,
  handleLmsWebhook
} = require('../controllers/lmsIntegrationController');
const { protect, checkRole } = require('../middleware/authMiddleware');

// GET /api/v1/integrations/lms/status
router.get(
    '/status',
    protect,
    checkRole(['Admin']),
    getLmsStatus
);

// POST /api/v1/integrations/lms/sync/courses
router.post(
    '/sync/courses',
    protect,
    checkRole(['Admin']),
    syncCoursesToLms
);

// GET /api/v1/integrations/lms/grades
router.get(
    '/grades',
    protect,
    checkRole(['Admin']),
    pullGradesFromLms
);

// POST /api/v1/integrations/lms/webhook
// Webhooks are typically public but should have signature verification within the controller
router.post(
    '/webhook',
    handleLmsWebhook // Specific security for webhooks (e.g. HMAC signature) handled in controller
);

module.exports = router;
