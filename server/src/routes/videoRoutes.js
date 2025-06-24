const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/videos/upload - Upload a new video
// Protected route: only authenticated users can upload
router.post('/upload', authMiddleware, videoController.uploadVideo);

// GET /api/videos/:videoId - Get details for a specific video
router.get('/:videoId', videoController.getVideoDetails);

// GET /api/videos/stream/:videoId/master.m3u8 - Serve the HLS master playlist
router.get('/stream/:videoId/master.m3u8', videoController.streamVideo);

// Note: .ts segments will be served by the static middleware configured in index.js
// based on the paths in the master.m3u8 file.

module.exports = router;
