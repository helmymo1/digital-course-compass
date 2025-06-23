const User = require('../models/User');

// This controller will be expanded later for other user-related operations.

exports.getMe = async (req, res) => {
  try {
    // The user object is attached to req by the authMiddleware.protect
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized. No user data found.' });
    }

    // Typically, you might want to re-fetch the user from DB to ensure data is fresh,
    // or select specific fields. req.user already contains the user document.
    const user = await User.findById(req.user.id).select('-password'); // Exclude password

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ message: 'Error retrieving user data.' });
  }
};

// Placeholder for updating user details (e.g., name)
// exports.updateMe = async (req, res) => {
//   // ... implementation ...
// };
