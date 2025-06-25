const express = require('express');
const router = express.Router();
const {
  listConfiguredTools,
  configureTool,
  getToolData,
  handleToolWebhook
} = require('../controllers/thirdPartyToolController');
const { protect, checkRole } = require('../middleware/authMiddleware');

// GET /api/v1/integrations/tools
router.get(
    '/',
    protect,
    checkRole(['Admin']),
    listConfiguredTools
);

// POST /api/v1/integrations/tools/:toolId/configure
router.post(
    '/:toolId/configure',
    protect,
    checkRole(['Admin']),
    configureTool
);

// GET /api/v1/integrations/tools/:toolId/data
router.get(
    '/:toolId/data',
    protect,
    checkRole(['Admin']), // Or more specific roles if necessary
    getToolData
);

// POST /api/v1/integrations/tools/:toolId/webhook
router.post(
    '/:toolId/webhook',
    handleToolWebhook // Security handled in controller
);

module.exports = router;
