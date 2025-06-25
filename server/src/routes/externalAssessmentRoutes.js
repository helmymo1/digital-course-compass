const express = require('express');
const router = express.Router();
const {
  configureAssessmentTool,
  triggerAssessment,
  getAssessmentResults,
  handleAssessmentWebhook
} = require('../controllers/externalAssessmentController');
const { protect, checkRole } = require('../middleware/authMiddleware');

// POST /api/v1/integrations/assessment/configure
router.post(
    '/configure',
    protect,
    checkRole(['Admin']),
    configureAssessmentTool
);

// POST /api/v1/integrations/assessment/trigger
router.post(
    '/trigger',
    protect,
    // Allowing Instructors or Admins to trigger. Students might trigger specific types via other routes.
    checkRole(['Instructor', 'Admin']),
    triggerAssessment
);

// GET /api/v1/integrations/assessment/results/:attemptId
router.get(
    '/results/:attemptId',
    protect, // Controller would handle if student can see own, or if instructor/admin
    getAssessmentResults
);

// POST /api/v1/integrations/assessment/webhook
router.post(
    '/webhook',
    handleAssessmentWebhook // Security handled in controller
);

module.exports = router;
