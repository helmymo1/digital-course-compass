const mongoose = require('mongoose');
const dotenv = require('dotenv');

const app = require('./src/index'); // Import the configured Express app

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MongoDB URI not found. Please set MONGODB_URI in your .env file');
  process.exit(1); // Exit if DB URI is not set
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully.');
    // Start the server only after successful DB connection
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit on connection error
  });
