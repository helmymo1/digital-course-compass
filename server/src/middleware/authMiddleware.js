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

// Authorization middleware
exports.authorize = (...requiredRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({
        status: 'fail',
        message: 'User roles not found. You do not have permission to perform this action.',
      });
    }

    const userRoles = req.user.roles.map(role => role.toLowerCase());
    const allowedRoles = requiredRoles.map(role => role.toLowerCase());

    const isAllowed = userRoles.some(userRole => allowedRoles.includes(userRole));

    if (!isAllowed) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};

// Middleware to check if a user is actively enrolled in a course
const Enrollment = require('../models/Enrollment'); // Ensure Enrollment model is imported
const mongoose = require('mongoose'); // For ObjectId validation

exports.checkEnrollment = (allowedStatuses = ['active', 'completed']) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      // Attempt to get courseId from params (courseId or id), body, or query for flexibility
      const courseId = req.params.courseId || req.params.id || req.body.courseId || req.query.courseId;

      if (!courseId) {
        return res.status(400).json({
          status: 'fail',
          message: 'Course ID not provided for enrollment check.',
        });
      }

      // Validate courseId format if using MongoDB ObjectIds
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
         return res.status(400).json({ status: 'fail', message: 'Invalid Course ID format for enrollment check.' });
      }

      // userId should be set by 'protect' middleware before this runs
      if (!userId) {
        // This case should ideally be caught by 'protect' middleware first
        return res.status(401).json({
          status: 'fail',
          message: 'User not authenticated for enrollment check.',
        });
      }

      const enrollment = await Enrollment.findOne({
        user: userId,
        course: courseId,
        status: { $in: allowedStatuses.map(s => s.toLowerCase()) }, // Ensure case-insensitivity for statuses
      }).lean(); // .lean() for faster queries if you only need plain JS object

      if (!enrollment) {
        return res.status(403).json({
          status: 'fail',
          message: 'Access denied. You must be actively enrolled in this course.',
        });
      }

      // Optionally attach enrollment to request if needed by subsequent handlers
      // req.enrollment = enrollment;
      next();

    } catch (error) {
      console.error('Check Enrollment Middleware Error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error verifying course enrollment.',
      });
    }
  };
};
