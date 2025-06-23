const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto'); // Added crypto

// Function to sign JWT token
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d' // Default to 90 days
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, roles } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      roles: roles || ['Student'] // Default role to Student if not provided
    });

    // Generate email verification token
    const verificationToken = newUser.createEmailVerificationToken();
    await newUser.save({ validateBeforeSave: false }); // Save the token and expiry to the user doc. Skip validation as we just created user.

    // Send verification email
    // Construct verification URL (adjust base URL as needed for frontend)
    // This URL should point to a frontend route that then calls the backend verification API.
    const verifyURL = `${req.protocol}://${req.get('host')}/api/v1/auth/verifyEmail/${verificationToken}`;

    const message = `
      Hi ${newUser.name},
      Welcome to Our Platform! Please verify your email address to complete your registration.
      Click this link to verify your email: ${verifyURL}
      If you did not create an account, please ignore this email.
      This link will expire in 10 minutes.
    `;

    try {
      await sendEmail({
        to: newUser.email,
        subject: 'Verify Your Email Address',
        text: message,
        // html: '<p>Your HTML content here if you have an HTML version</p>' // Optional HTML version
      });
      console.log('Verification email supposedly sent.');
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Important: Decide how to handle this.
      // Should registration fail? Or proceed and let user request verification again?
      // For now, we'll log and proceed, but in production, this needs careful consideration.
      // Potentially, delete the user if email sending fails critically to allow them to re-register.
      // Or, mark user as pending verification and don't issue JWT yet.
    }

    // Generate token (Consider if token should be sent before email verification)
    const token = signToken(newUser._id);

    // Send response (excluding password)
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });

  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        status: 'fail',
        message: messages.join('. ')
      });
    }
    console.error('Registration Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during registration. Please try again later.'
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token) // Token from URL parameter
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: { $gt: Date.now() }
    });

    // 2) If token has not expired and there is user, set the new password
    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired.'
      });
    }

    if (!req.body.password || !req.body.passwordConfirm) {
        return res.status(400).json({
            status: 'fail',
            message: 'Please provide a new password and confirm it.'
        });
    }

    if (req.body.password !== req.body.passwordConfirm) {
        return res.status(400).json({
            status: 'fail',
            message: 'Passwords do not match.'
        });
    }

    // Check password length ( reusing model's minlength if possible, or define here)
    if (req.body.password.length < 6) {
         return res.status(400).json({
            status: 'fail',
            message: 'Password must be at least 6 characters long.'
        });
    }


    user.password = req.body.password;
    // The pre-save hook in User.js will automatically hash the new password.
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    // Consider adding passwordChangedAt field update here if implementing that security feature
    // user.passwordChangedAt = Date.now() - 1000; // Subtract 1s to ensure token generated before this is invalid

    await user.save(); // This will trigger the pre-save hook for hashing

    // 3) Log the user in, send JWT
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      message: 'Password reset successful.'
    });

  } catch (error) {
    console.error('Reset Password Error:', error);
    // Handle Mongoose validation errors specifically if they occur from .save()
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        status: 'fail',
        message: messages.join('. ')
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while resetting your password. Please try again later.'
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // Note: Even if user not found, send a generic success message
      // to prevent attackers from guessing registered emails.
      console.log(`Password reset attempt for non-existent user: ${req.body.email}`);
      return res.status(200).json({
        status: 'success',
        message: 'If your email address is registered with us, you will receive a password reset link.'
      });
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); // Save token and expiry to user doc

    // 3) Send it to user's email
    // This URL should point to a frontend route that then calls the backend resetPassword API with the token
    const resetURL = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
    // Or, if frontend handles URL parsing to extract token and pass it to API:
    // const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;


    const message = `
      Hi ${user.name},
      Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.
      Alternatively, if you have a frontend page, you might guide them there:
      Click this link to reset your password: ${resetURL}
      If you didn't forget your password, please ignore this email!
      This link will expire in 10 minutes.
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Your Password Reset Token (valid for 10 min)',
        text: message
        // html: Can add HTML version here
      });

      res.status(200).json({
        status: 'success',
        message: 'Password reset token sent to email!'
      });
    } catch (err) {
      console.error('Error sending password reset email:', err);
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      await user.save({ validateBeforeSave: false }); // Rollback token fields if email fails

      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the password reset email. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An internal error occurred. Please try again later.'
    });
  }
};

exports.logout = (req, res) => {
  // For JWT, logout is primarily a client-side action: the client should delete the token.
  // This server-side endpoint is mostly conventional.
  // If using httpOnly cookies for JWT, this is where you'd clear the cookie.
  // res.cookie('jwt', 'loggedout', {
  //   expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
  //   httpOnly: true
  // });
  res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
};

exports.verifyEmail = async (req, res) => {
  try {
    // 1) Get user based on the token
    const hashedToken = crypto // Ensure crypto is required at the top of the file
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationTokenExpires: { $gt: Date.now() }
    });

    // 2) If token has not expired and there is user, set the new password
    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired. Please request a new verification email.'
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false }); // Save changes, skip full validation

    // 3) Log the user in, send JWT (optional, but good UX)
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      message: 'Email verified successfully!'
    });

  } catch (error) {
    console.error('Email Verification Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during email verification. Please try again later.'
    });
  }
};

// Login, logout, password reset, etc., will be added here later.

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password'); // Explicitly select password

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    // 3) If everything ok, send token to client
    const token = signToken(user._id);

    // Remove password from output - although it was selected, it won't be sent if not explicitly included
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during login. Please try again later.'
    });
  }
};
