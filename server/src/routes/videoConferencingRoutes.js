const express = require('express');
const router = express.Router();
const {
  createMeeting,
  getMeetingInfo,
  listRecordings,
  handleVideoConferenceWebhook
} = require('../controllers/videoConferencingController');
const { protect, checkRole } = require('../middleware/authMiddleware');

// POST /api/v1/integrations/video/meetings
router.post(
    '/meetings',
    protect,
    checkRole(['Instructor', 'Admin']),
    createMeeting
);

// GET /api/v1/integrations/video/meetings/:meetingId
router.get(
    '/meetings/:meetingId',
    protect, // Further access control logic can be in the controller (e.g. participant check)
    getMeetingInfo
);

// GET /api/v1/integrations/video/recordings
router.get(
    '/recordings',
    protect, // Further access control logic can be in the controller
    listRecordings
);

// POST /api/v1/integrations/video/webhook
router.post(
    '/webhook',
    handleVideoConferenceWebhook // Security handled in controller
);

module.exports = router;
