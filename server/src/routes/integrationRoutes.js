const express = require('express');
const router = express.Router();

const lmsIntegrationRoutes = require('./lmsIntegrationRoutes');
const thirdPartyToolRoutes = require('./thirdPartyToolRoutes');
const calendarIntegrationRoutes = require('./calendarIntegrationRoutes');
const videoConferencingRoutes = require('./videoConferencingRoutes');
const externalAssessmentRoutes = require('./externalAssessmentRoutes');

// Mount sub-routers
router.use('/lms', lmsIntegrationRoutes);
router.use('/tools', thirdPartyToolRoutes);
router.use('/calendar', calendarIntegrationRoutes);
router.use('/video', videoConferencingRoutes);
router.use('/assessment', externalAssessmentRoutes);

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Integration API Base Route - All sub-integrations mounted.' });
});

module.exports = router;
