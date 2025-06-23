const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: '../.env' }); // Adjusted path to .env

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // For parsing application/json

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Mount Routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes); // Mount user routes

// Basic Route
app.get('/', (req, res) => {
  res.send('Auth System API is running!');
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MongoDB URI not found. Please set MONGODB_URI in your .env file');
  process.exit(1); // Exit if DB URI is not set
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit on connection error
  });


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
