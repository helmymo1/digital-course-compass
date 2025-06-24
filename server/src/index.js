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

// Mount Routers
// Ensure your API base path is consistent. If it's /api/v1, it should be used here.
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes); // Mount user routes
app.use('/api/v1/courses', courseRoutes); // Mount course routes
app.use('/api/v1/enrollments', enrollmentRoutes); // Mount enrollment routes
app.use('/api/v1/payments', paymentRoutes); // Mount payment routes

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
