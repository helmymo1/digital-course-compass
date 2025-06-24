const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');
const app = require('../index'); // Load the Express app
const Video = require('../models/Video');
const User = require('../models/User'); // Needed to create a test user for uploads

// Mock parts of videoController's dependencies
jest.mock('fluent-ffmpeg'); // Mock the entire fluent-ffmpeg library

// Mock the processVideo function from videoController directly for upload route tests
// We'll test processVideo more directly if needed or assume its unit tests cover its internal logic.
const videoController = require('./videoController');
const actualProcessVideo = videoController.processVideo; // Save original
videoController.processVideo = jest.fn(() => Promise.resolve());


// Set a default JWT_SECRET for testing if not already set
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jest-video';

let mongoServer;
let testUser;
let authToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create a test user and generate a token for authenticated routes
  const userPassword = 'testPassword123';
  testUser = new User({
    name: 'Test Video Uploader',
    email: 'video.uploader@example.com',
    password: userPassword, // Will be hashed by pre-save hook
    emailVerified: true,
  });
  await testUser.save();

  // Log in the user to get a token
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: testUser.email, password: userPassword });
  authToken = loginRes.body.token;
});

afterAll(async () => {
  videoController.processVideo = actualProcessVideo; // Restore original function
  await mongoose.disconnect();
  await mongoServer.stop();
  // Clean up uploads directory if files were created (though mocks should prevent this)
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'videos_test'); // Use a test-specific dir
  if (fs.existsSync(uploadsDir)) {
    fs.rmSync(uploadsDir, { recursive: true, force: true });
  }
});

beforeEach(async () => {
  await Video.deleteMany({});
  jest.clearAllMocks(); // Clear all mocks before each test
});

describe('Video Controller - Upload', () => {
  const uploadUrl = '/api/v1/videos/upload';

  it('should upload a video successfully with valid data and authentication', async () => {
    const videoTitle = 'My Test Video';
    const videoFilePath = path.join(__dirname, 'test-fixtures', 'sample-video.mp4'); // Dummy file

    // Ensure dummy file exists for multer to pick up
    const fixturesDir = path.join(__dirname, 'test-fixtures');
    if (!fs.existsSync(fixturesDir)) fs.mkdirSync(fixturesDir);
    if (!fs.existsSync(videoFilePath)) fs.writeFileSync(videoFilePath, 'dummy video content');

    const res = await request(app)
      .post(uploadUrl)
      .set('Authorization', `Bearer ${authToken}`)
      .field('title', videoTitle)
      .attach('videoFile', videoFilePath);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Video uploaded successfully. Processing has started.');
    expect(res.body.video).toHaveProperty('title', videoTitle);
    expect(res.body.video).toHaveProperty('uploadedBy', testUser._id.toString());
    expect(res.body.video.filePath).toMatch(/^\/uploads\/videos\/\d+-\d+-sample-video\.mp4$/);

    const dbVideo = await Video.findById(res.body.video._id);
    expect(dbVideo).toBeTruthy();
    expect(dbVideo.title).toBe(videoTitle);

    // Check that processVideo was called
    expect(videoController.processVideo).toHaveBeenCalledTimes(1);
    expect(videoController.processVideo).toHaveBeenCalledWith(
      expect.objectContaining({ _id: dbVideo._id }), // a Video object
      expect.stringContaining(dbVideo.filePath.substring(1)) // the absolute path to the uploaded file
    );

    // Clean up dummy file
    if (fs.existsSync(videoFilePath)) fs.unlinkSync(videoFilePath);
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app)
      .post(uploadUrl)
      .field('title', 'No Auth Video')
      .attach('videoFile', path.join(__dirname, 'test-fixtures', 'sample-video.mp4')); // Dummy file

    expect(res.statusCode).toEqual(401); // Assuming authMiddleware sends 401
    expect(res.body).toHaveProperty('message', 'Authentication token is required or invalid.');
  });

  it('should return 400 if no video file is provided', async () => {
    const res = await request(app)
      .post(uploadUrl)
      .set('Authorization', `Bearer ${authToken}`)
      .field('title', 'No File Video');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'No video file uploaded.');
  });

  it('should return 400 if title is missing', async () => {
    const videoFilePath = path.join(__dirname, 'test-fixtures', 'sample-video.mp4');
    if (!fs.existsSync(videoFilePath)) fs.writeFileSync(videoFilePath, 'dummy video content');

    const res = await request(app)
      .post(uploadUrl)
      .set('Authorization', `Bearer ${authToken}`)
      .attach('videoFile', videoFilePath);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Video title is required.');
    if (fs.existsSync(videoFilePath)) fs.unlinkSync(videoFilePath);
  });

  it('should return 400 if file is not a video', async () => {
    const nonVideoFilePath = path.join(__dirname, 'test-fixtures', 'not-a-video.txt');
    if (!fs.existsSync(nonVideoFilePath)) fs.writeFileSync(nonVideoFilePath, 'dummy text content');

    const res = await request(app)
      .post(uploadUrl)
      .set('Authorization', `Bearer ${authToken}`)
      .field('title', 'Non Video File')
      .attach('videoFile', nonVideoFilePath);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Not a video file! Please upload only videos.');
    if (fs.existsSync(nonVideoFilePath)) fs.unlinkSync(nonVideoFilePath);
  });
});

describe('Video Controller - Get Details', () => {
  it('should get video details successfully', async () => {
    const videoData = {
      title: 'Test Video Details',
      description: 'Details here',
      uploadedBy: testUser._id,
      originalFileName: 'sample.mp4',
      filePath: '/uploads/videos/sample_details.mp4',
      hlsPlaylistPath: '/uploads/videos/sample_details_id/hls/master.m3u8',
      thumbnailPath: '/uploads/videos/sample_details_id/thumbnails/thumb.png',
      duration: 120,
    };
    const video = await Video.create(videoData);

    const res = await request(app).get(`/api/v1/videos/${video._id}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', video._id.toString());
    expect(res.body).toHaveProperty('title', videoData.title);
    expect(res.body).toHaveProperty('hlsPlaylistPath', videoData.hlsPlaylistPath);
  });

  it('should return 404 if video not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/v1/videos/${nonExistentId}`);
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Video not found.');
  });
});


describe('Video Controller - Stream HLS Playlist', () => {
  const hlsStreamUrlBase = '/api/v1/videos/stream';

  it('should serve HLS master playlist if video and playlist exist', async () => {
    const videoId = new mongoose.Types.ObjectId();
    const mockHlsPath = `/uploads/videos/${videoId}/hls/master.m3u8`;
    const absoluteMockHlsPath = path.join(__dirname, '..', '..', mockHlsPath);
    const hlsDir = path.dirname(absoluteMockHlsPath);

    // Create mock video in DB
    await Video.create({
      _id: videoId,
      title: 'HLS Stream Test Video',
      uploadedBy: testUser._id,
      filePath: '/uploads/videos/hls_test.mp4',
      originalFileName: 'hls_test.mp4',
      hlsPlaylistPath: mockHlsPath, // Stored path
      status: 'processed'
    });

    // Mock the m3u8 file
    if (!fs.existsSync(hlsDir)) fs.mkdirSync(hlsDir, { recursive: true });
    fs.writeFileSync(absoluteMockHlsPath, '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360\nsegment1.ts');

    const res = await request(app).get(`${hlsStreamUrlBase}/${videoId}/master.m3u8`);

    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toMatch(/application\/vnd\.apple\.mpegurl|application\/x-mpegurl/); // Common HLS MIME types
    expect(res.text).toContain('#EXTM3U');

    // Cleanup
    fs.unlinkSync(absoluteMockHlsPath);
    fs.rmdirSync(hlsDir);
    if (fs.existsSync(path.dirname(hlsDir))) fs.rmdirSync(path.dirname(hlsDir), { recursive: true });

  });

  it('should return 404 if video for HLS streaming not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`${hlsStreamUrlBase}/${nonExistentId}/master.m3u8`);
    expect(res.statusCode).toEqual(404);
  });

  it('should return 404 if video has no HLS path', async () => {
    const video = await Video.create({
      title: 'No HLS Path Video',
      uploadedBy: testUser._id,
      filePath: '/uploads/videos/no_hls.mp4',
      originalFileName: 'no_hls.mp4',
      status: 'processed' // Processed, but imagine hlsPlaylistPath is null
    });
    const res = await request(app).get(`${hlsStreamUrlBase}/${video._id}/master.m3u8`);
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Video not found or not processed for streaming.');
  });

   it('should return 500 if HLS playlist file does not exist on disk', async () => {
    const videoId = new mongoose.Types.ObjectId();
    const mockHlsPath = `/uploads/videos/${videoId}/hls/master.m3u8`; // Path that won't exist

    await Video.create({
      _id: videoId,
      title: 'Missing File HLS Test Video',
      uploadedBy: testUser._id,
      filePath: '/uploads/videos/missing_hls_file.mp4',
      originalFileName: 'missing_hls_file.mp4',
      hlsPlaylistPath: mockHlsPath,
      status: 'processed'
    });

    // Ensure the file does NOT exist
    const absoluteMockHlsPath = path.join(__dirname, '..', '..', mockHlsPath);
    if (fs.existsSync(absoluteMockHlsPath)) fs.unlinkSync(absoluteMockHlsPath); // remove if it somehow exists

    const res = await request(app).get(`${hlsStreamUrlBase}/${videoId}/master.m3u8`);

    // res.sendFile sends 404 if file not found by default, which our controller might not override to 500 unless explicitly handled.
    // The current controller's res.sendFile error handler sends 500.
    expect(res.statusCode).toEqual(500);
    expect(res.text).toBe("Could not send HLS playlist.");
  });

});
