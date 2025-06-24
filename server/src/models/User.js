const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Don't return password by default
  },
  roles: {
    type: [String],
    enum: ['Student', 'Instructor', 'Admin'],
    default: ['Student'],
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationTokenExpires: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  // Fields for social logins
  googleId: String,
  githubId: String,
  linkedinId: String,
  stripeCustomerId: { // Added Stripe Customer ID
    type: String,
    // unique: true, // Optional: if you want to ensure it's unique, though Stripe IDs are inherently unique
    // sparse: true, // Optional: if using unique, use sparse for users who don't have one yet
  },
}, { timestamps: true });

// Pre-save hook to hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare candidate password with the user's password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate email verification token
userSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set token to expire in 10 minutes (or a configurable time)
  this.emailVerificationTokenExpires = Date.now() + 10 * 60 * 1000;

  return verificationToken; // Return the unhashed token to send via email
};

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set token to expire in 10 minutes (or a configurable time)
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken; // Return the unhashed token to send via email
};

const User = mongoose.model('User', userSchema);

module.exports = User;
