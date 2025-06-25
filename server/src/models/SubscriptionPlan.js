const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Plan name is required.'],
        trim: true,
        minlength: [3, 'Plan name must be at least 3 characters long.'],
        maxlength: [100, 'Plan name cannot exceed 100 characters.'],
        // Unique constraint handled by partial index
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters.'],
    },
    stripePriceId: {
        type: String,
        trim: true,
        // unique: true, // Handled by partial index
        sparse: true,
    },
    paypalPlanId: {
        type: String,
        trim: true,
        // unique: true, // Handled by partial index
        sparse: true,
    },
    price: {
        type: Number,
        required: [true, 'Price is required.'],
        min: [0, 'Price cannot be negative.'],
    },
    currency: {
        type: String,
        required: [true, 'Currency is required.'],
        uppercase: true,
        trim: true,
        minlength: [3, 'Currency code must be 3 characters.'],
        maxlength: [3, 'Currency code must be 3 characters.'],
    },
    interval: {
        type: String,
        required: [true, 'Interval is required.'],
        enum: {
            values: ['day', 'week', 'month', 'year'],
            message: 'Interval "{VALUE}" is not valid.'
        },
    },
    intervalCount: {
        type: Number,
        default: 1,
        min: [1, 'Interval count must be at least 1.'],
    },
    features: [{
        type: String,
        trim: true,
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
    trialPeriodDays: {
        type: Number,
        default: 0,
        min: [0, 'Trial period days cannot be negative.'],
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true,
    },
}, { timestamps: true });

// Unique indexes considering soft delete
subscriptionPlanSchema.index({ name: 1, deletedAt: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
subscriptionPlanSchema.index({ stripePriceId: 1, deletedAt: 1 }, { unique: true, sparse: true, partialFilterExpression: { deletedAt: null } });
subscriptionPlanSchema.index({ paypalPlanId: 1, deletedAt: 1 }, { unique: true, sparse: true, partialFilterExpression: { deletedAt: null } });

// Index for isActive and deletedAt for common queries
subscriptionPlanSchema.index({ isActive: 1, deletedAt: 1 });

// Custom validator: Ensure that for an active, non-deleted plan, at least one gateway ID is present.
subscriptionPlanSchema.path('isActive').validate(function (value) {
  if (value && !this.deletedAt) { // Only validate if plan is active and not soft-deleted
    return !!(this.stripePriceId || this.paypalPlanId);
  }
  return true; // If not active or is deleted, validation passes
}, 'An active plan must have at least a Stripe Price ID or a PayPal Plan ID.');


const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

module.exports = SubscriptionPlan;
