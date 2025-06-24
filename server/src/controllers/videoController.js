const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const Video = require('../models/Video');

// Attempt to set FFmpeg path if environment variable is set
if (process.env.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
}

// --- Helper Function for Video Processing ---
async function processVideo(video, originalFilePathFull) {
  console.log(`Starting processing for video ID: ${video._id}, path: ${originalFilePathFull}`);
  const videoId = video._id.toString();
  // Use a different directory for test uploads to keep them separate for processed files too
  const baseUploadsDir = process.env.NODE_ENV === 'test' ? 'uploads_test' : 'uploads';
  const videoUploadDirRoot = path.join(__dirname, '..', '..', baseUploadsDir, 'videos');

  const outputDirBase = path.join(videoUploadDirRoot, videoId);
  const hlsDir = path.join(outputDirBase, 'hls');
  const thumbnailDir = path.join(outputDirBase, 'thumbnails');

  // Relative paths for DB will also reflect the test environment if applicable in source path
  // but generally, they should point to the "production" structure the app expects.
  // However, for testing file system interactions, these paths might also change based on NODE_ENV
  // For simplicity, we'll assume db paths are always the "production" structure.
  // The key is that the physical storage during tests IS separated.
  const dbHlsPlaylistPath = `/uploads/videos/${videoId}/hls/master.m3u8`;
  const dbThumbnailPathPattern = `/uploads/videos/${videoId}/thumbnails/thumbnail-01.png`;


  try {
    await fs.promises.mkdir(hlsDir, { recursive: true });
    await fs.promises.mkdir(thumbnailDir, { recursive: true });

    const hlsPlaylistPathLocal = path.join(hlsDir, 'master.m3u8'); // Physical path for ffmpeg

    // 1. Generate Thumbnail
    await new Promise((resolve, reject) => {
      ffmpeg(originalFilePathFull)
        .on('end', () => {
          console.log(`Thumbnail generation finished for video ID: ${videoId}`);
          resolve();
        })
        .on('error', (err) => {
          console.error(`Error generating thumbnail for ${videoId}:`, err.message);
          reject(err);
        })
        .screenshots({
          count: 1,
          folder: thumbnailDir,
          filename: 'thumbnail-01.png', // Fixed name for easier DB link
          timemarks: [ '10%' ]
        });
    });

    // 2. Get Video Duration
    let duration = 0;
    await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(originalFilePathFull, (err, metadata) => {
            if (err) {
                console.error(`Error getting duration for ${videoId}:`, err.message);
                return reject(err);
            }
            duration = metadata.format.duration || 0;
            console.log(`Duration for ${videoId}: ${duration}s`);
            resolve();
        });
    });

    // 3. Transcode to HLS
    await new Promise((resolve, reject) => {
      ffmpeg(originalFilePathFull)
        .outputOptions([
          '-profile:v baseline', '-level 3.0', '-start_number 0',
          '-hls_time 10', '-hls_list_size 0', '-f hls'
        ])
        .output(hlsPlaylistPathLocal)
        .on('start', (commandLine) => console.log(`FFmpeg HLS processing started for ${videoId}: ${commandLine}`))
        .on('progress', (progress) => {
          if (progress.percent) console.log(`Processing ${videoId} (HLS): ${progress.percent.toFixed(2)}% done`);
        })
        .on('end', () => {
          console.log(`HLS transcoding finished for video ID: ${videoId}`);
          resolve();
        })
        .on('error', (err, stdout, stderr) => {
          console.error(`Error during HLS transcoding for ${videoId}:`, err.message, stdout, stderr);
          reject(err);
        })
        .run();
    });

    video.hlsPlaylistPath = dbHlsPlaylistPath;
    video.thumbnailPath = dbThumbnailPathPattern;
    video.duration = duration;
    video.status = 'processed';
    await video.save();
    console.log(`Video ID ${videoId} successfully processed and DB updated.`);

  } catch (error) {
    console.error(`Failed to process video ${videoId}:`, error.message, error.stack);
    video.status = 'processing_failed';
    await video.save();
  }
}

// --- Multer Configuration ---
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const baseUploadsDir = process.env.NODE_ENV === 'test' ? 'uploads_test' : 'uploads';
    const uploadPath = path.join(__dirname, '..', '..', baseUploadsDir, 'videos');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const videoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Not a video file! Please upload only videos.'), false);
  }
};

const upload = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 1024 * 1024 * 500 }
}).single('videoFile');

// --- Controller Functions ---
exports.uploadVideo = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'No video file uploaded.' });

    const { title, description } = req.body;
    const { filename, originalname } = req.file;
    const originalFilePathFull = req.file.path;
    // Determine DB path based on NODE_ENV for consistency if needed, but usually DB stores "prod" paths
    const baseDbPath = process.env.NODE_ENV === 'test' ? '/uploads_test/videos/' : '/uploads/videos/';
    const dbOriginalFilePath = `${baseDbPath}${filename}`;


    if (!title) {
      fs.unlink(originalFilePathFull, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting orphaned file:", unlinkErr);
      });
      return res.status(400).json({ message: 'Video title is required.' });
    }

    try {
      const newVideo = new Video({
        title,
        description: description || '',
        uploadedBy: req.user.id,
        originalFileName: originalname,
        filePath: dbOriginalFilePath, // Path to the original uploaded file for DB
        status: 'uploading',
      });
      await newVideo.save();

      processVideo(newVideo, originalFilePathFull).catch(procError => {
        console.error(`Background processing failed for video ${newVideo._id}: ${procError.message}`);
      });

      res.status(201).json({
        message: 'Video uploaded successfully. Processing has started.',
        video: newVideo
      });

    } catch (dbError) {
      fs.unlink(originalFilePathFull, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting orphaned file on DB error:", unlinkErr);
      });
      console.error('Error saving video to database:', dbError);
      res.status(500).json({ message: 'Error saving video information.' });
    }
  });
};

exports.getVideoDetails = async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) return res.status(404).json({ message: 'Video not found.' });
    res.status(200).json(video);
  } catch (error) {
    console.error('Error fetching video details:', error);
    res.status(500).json({ message: 'Error fetching video details.' });
  }
};

exports.streamVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video || !video.hlsPlaylistPath) {
      return res.status(404).json({ message: 'Video not found or not processed for streaming.' });
    }

    // Construct physical path to the HLS playlist, considering NODE_ENV for base directory
    const baseUploadsDir = process.env.NODE_ENV === 'test' ? 'uploads_test' : 'uploads';
    // hlsPlaylistPath is like /uploads/videos/VIDEO_ID/hls/master.m3u8
    // We need to replace the leading '/uploads/' with the correct base e.g. '../../uploads_test/'
    const relativeHlsPath = video.hlsPlaylistPath.replace(/^\/uploads\//, `${baseUploadsDir}/`);
    const m3u8Path = path.join(__dirname, '..', '..', relativeHlsPath);

    res.sendFile(m3u8Path, (err) => {
        if (err) {
            console.error("Error sending m3u8 file:", m3u8Path, err);
            if (!res.headersSent) {
                 res.status(500).send("Could not send HLS playlist.");
            }
        }
    });

  } catch (error) {
    console.error('Error streaming video:', error);
    res.status(500).json({ message: 'Error streaming video.' });
  }
};
