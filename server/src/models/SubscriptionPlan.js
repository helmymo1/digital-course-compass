const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    stripePriceId: {
        type: String,
        // required: true, // Not strictly required if plan can be PayPal only
        unique: true,
        sparse: true, // Allows null if plan is PayPal-only
    },
    paypalPlanId: {
        type: String,
        unique: true,
        sparse: true, // Allows null if plan is Stripe-only
    },
    price: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
        uppercase: true,
    },
    interval: {
        type: String,
        required: true,
        enum: ['day', 'week', 'month', 'year'],
    },
    intervalCount: {
        type: Number,
        default: 1,
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
        default: 0
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
    }
}, { timestamps: true });

subscriptionPlanSchema.index({ stripePriceId: 1 });
subscriptionPlanSchema.index({ paypalPlanId: 1 });
subscriptionPlanSchema.index({ isActive: 1 });

// Ensure that for a given plan, at least one gateway ID is present if it's active.
// This is more of an application-level validation or a pre-save hook.
// For simplicity, not adding a complex validator here, but it's a consideration.

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

module.exports = SubscriptionPlan;
