const express = require('express');
const router = express.Router();
const {
  getCalendarEvents,
  createCalendarEvent,
  syncCalendar,
  handleCalendarWebhook
} = require('../controllers/calendarIntegrationController');
const { protect, checkRole } = require('../middleware/authMiddleware'); // Assuming Admin for sync, user for own events

// GET /api/v1/integrations/calendar/events
// Users can get their own events. Admins could potentially access more (logic in controller).
router.get(
    '/events',
    protect, // All logged-in users can try, controller can filter by user vs admin
    getCalendarEvents
);

// POST /api/v1/integrations/calendar/events
// Users can create events for themselves.
router.post(
    '/events',
    protect,
    createCalendarEvent
);

// POST /api/v1/integrations/calendar/sync
// Typically an admin task, or a user managing their own sync settings.
router.post(
    '/sync',
    protect,
    checkRole(['Admin']), // Or could be user-specific if they manage their own sync
    syncCalendar
);

// POST /api/v1/integrations/calendar/webhook
router.post(
    '/webhook',
    handleCalendarWebhook // Security handled in controller
);

module.exports = router;
