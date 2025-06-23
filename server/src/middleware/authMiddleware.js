const jwt = require('jsonwebtoken');
const { promisify } = require('util'); // To use async/await with jwt.verify
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.'
      });
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token does no longer exist.'
      });
    }

    // 4) Check if user changed password after the token was issued
    // This is an advanced check, requires a 'passwordChangedAt' field in User model
    // if (currentUser.changedPasswordAfter(decoded.iat)) {
    //   return res.status(401).json({
    //     status: 'fail',
    //     message: 'User recently changed password! Please log in again.'
    //   });
    // }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ status: 'fail', message: 'Invalid token. Please log in again.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'fail', message: 'Your token has expired. Please log in again.' });
    }

    console.error('Auth Middleware Error:', error);
    return res.status(500).json({ status: 'error', message: 'Something went wrong in authentication.' });
  }
};

// Authorization middleware for roles will be added later here
// exports.restrictTo = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) { // Assuming single role, adjust if multiple roles
//       return res.status(403).json({
//         status: 'fail',
//         message: 'You do not have permission to perform this action'
//       });
//     }
//     next();
//   };
// };
