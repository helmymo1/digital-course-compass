const express = require('express');
const dotenv = require('dotenv');

// Load environment variables - this is still useful if any part of the app setup needs them directly,
// though server.js also loads them for DB connection and port.
// Ensuring correct path to .env from server/src/index.js
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });


const app = express();

// Middleware
app.use(express.json()); // For parsing application/json

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes'); // Import course routes
const enrollmentRoutes = require('./routes/enrollmentRoutes'); // Import enrollment routes
const paymentRoutes = require('./routes/paymentRoutes'); // Import payment routes
const subscriptionPlanRoutes = require('./routes/subscriptionPlanRoutes'); // Import subscription plan routes
const analyticsRoutes = require('./routes/analyticsRoutes'); // Import analytics routes
const moduleRoutes = require('./routes/moduleRoutes'); // Import module routes
const lessonRoutes = require('./routes/lessonRoutes'); // Import lesson routes
const progressRoutes = require('./routes/progressRoutes'); // Import progress routes
const activityLogRoutes = require('./routes/activityLogRoutes'); // Import activity log routes
const quizRoutes = require('./routes/quizRoutes'); // Import quiz routes
const quizAttemptRoutes = require('./routes/quizAttemptRoutes'); // Import quiz attempt routes
const learningPathRoutes = require('./routes/learningPathRoutes'); // Import learning path routes
const userLearningPathRoutes = require('./routes/userLearningPathRoutes'); // Import user learning path routes
const feedbackRoutes = require('./routes/feedbackRoutes'); // Import feedback routes
const forumPostRoutes = require('./routes/forumPostRoutes'); // Import forum post routes

// Mount Routers
// Ensure your API base path is consistent. If it's /api/v1, it should be used here.
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes); // Mount user routes
app.use('/api/v1/courses', courseRoutes); // Mount course routes
app.use('/api/v1/enrollments', enrollmentRoutes); // Mount enrollment routes
app.use('/api/v1/payments', paymentRoutes); // Mount payment routes
app.use('/api/v1/subscription-plans', subscriptionPlanRoutes); // Mount subscription plan routes (covers public and admin via internal protection)
app.use('/api/v1/admin/analytics', analyticsRoutes); // Mount analytics routes (admin)
app.use('/api/v1/modules', moduleRoutes); // Mount module routes
app.use('/api/v1/lessons', lessonRoutes); // Mount lesson routes
app.use('/api/v1/progress', progressRoutes); // Mount progress routes
app.use('/api/v1/activity', activityLogRoutes); // Mount activity log routes
app.use('/api/v1/quizzes', quizRoutes); // Mount quiz routes
app.use('/api/v1/attempts', quizAttemptRoutes); // Mount quiz attempt routes
app.use('/api/v1/learning-paths', learningPathRoutes); // Mount learning path routes
app.use('/api/v1/user-learning-paths', userLearningPathRoutes); // Mount user learning path routes
app.use('/api/v1/feedback', feedbackRoutes); // Mount feedback routes
app.use('/api/v1/forum-posts', forumPostRoutes); // Mount forum post routes

// Basic Route
app.get('/', (req, res) => {
  res.send('Auth System API is running!');
});

// Error handling middleware (optional, but good practice)
// Example:
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

module.exports = app; // Export the configured app instance
