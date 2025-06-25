const mongoose = require('mongoose');

const userSubscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required for subscription.'],
        index: true,
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
        required: [true, 'Subscription plan is required.'],
    },
    stripeSubscriptionId: {
        type: String,
        // required: true, // Conditional, see below
        // unique: true, // Handled by partial index
        sparse: true,
        trim: true,
        index: true, // Keep basic index for lookups
    },
    paypalSubscriptionId: {
        type: String,
        // unique: true, // Handled by partial index
        sparse: true,
        trim: true,
        index: true, // Keep basic index for lookups
    },
    gateway: {
        type: String,
        required: [true, 'Payment gateway is required.'],
        enum: {
            values: ['Stripe', 'PayPal'],
            message: 'Gateway "{VALUE}" is not supported.'
        },
    },
    gatewayCustomerId: {
        type: String,
        required: [true, 'Gateway Customer ID is required.'],
        trim: true,
    },
    gatewayPriceOrPlanId: {
        type: String,
        required: [true, 'Gateway Price/Plan ID is required.'],
        trim: true,
    },
    status: {
        type: String,
        required: [true, 'Subscription status is required.'],
        enum: {
            values: [
                'pending_approval',
                'active',
                'trialing',
                'suspended',
                'canceled',
                'expired',
                'payment_due',
                'incomplete'
            ],
            message: 'Subscription status "{VALUE}" is not valid.'
        }
    },
    currentPeriodStart: {
        type: Date,
    },
    currentPeriodEnd: {
        type: Date,
        index: true,
    },
    trialStart: {
        type: Date,
    },
    trialEnd: {
        type: Date,
    },
    cancelAtPeriodEnd: {
        type: Boolean,
        default: false,
    },
    canceledAt: {
        type: Date,
    },
    endedAt: {
        type: Date,
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

// Conditional requirement for gateway-specific IDs
userSubscriptionSchema.path('stripeSubscriptionId').required(function() {
    return this.gateway === 'Stripe' && !this.deletedAt; // Only required if Stripe and not deleted
}, 'Stripe Subscription ID is required for active Stripe gateway subscriptions.');

userSubscriptionSchema.path('paypalSubscriptionId').required(function() {
    return this.gateway === 'PayPal' && !this.deletedAt; // Only required if PayPal and not deleted
}, 'PayPal Subscription ID is required for active PayPal gateway subscriptions.');

// Indexes
userSubscriptionSchema.index({ user: 1, status: 1, deletedAt: 1 }); // Include deletedAt in common queries
userSubscriptionSchema.index({ user: 1, gateway: 1, status: 1, deletedAt: 1 }); // Include deletedAt

// Partial unique indexes for gateway subscription IDs
userSubscriptionSchema.index(
    { stripeSubscriptionId: 1, deletedAt: 1 },
    { unique: true, sparse: true, partialFilterExpression: { deletedAt: null, stripeSubscriptionId: { $ne: null } } }
);
userSubscriptionSchema.index(
    { paypalSubscriptionId: 1, deletedAt: 1 },
    { unique: true, sparse: true, partialFilterExpression: { deletedAt: null, paypalSubscriptionId: { $ne: null } } }
);


const UserSubscription = mongoose.model('UserSubscription', userSubscriptionSchema);

module.exports = UserSubscription;
