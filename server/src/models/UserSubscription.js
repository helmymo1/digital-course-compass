const mongoose = require('mongoose');

const userSubscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    plan: { // Reference to our SubscriptionPlan model
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
        required: true,
    },
    stripeSubscriptionId: { // ID of the Subscription object in Stripe
        type: String,
        required: true,
        unique: true,
        sparse: true, // Required only if gateway is Stripe
        index: true,
    },
    paypalSubscriptionId: { // ID of the Subscription agreement in PayPal
        type: String,
        unique: true,
        sparse: true, // Required only if gateway is PayPal
        index: true,
    },
    gateway: { // To identify the payment gateway for this subscription
        type: String,
        required: true,
        enum: ['Stripe', 'PayPal'],
    },
    gatewayCustomerId: { // Stripe Customer ID or PayPal Payer ID (if applicable/needed)
        type: String,
        required: true, // Customer must exist on the gateway
    },
    gatewayPriceOrPlanId: { // Stripe Price ID or PayPal Plan ID (denormalized)
        type: String,
        required: true,
    },
    status: {
        // Stripe: active, past_due, unpaid, canceled, incomplete, incomplete_expired, trialing, ended, paused
        // PayPal: APPROVAL_PENDING, APPROVED, ACTIVE, SUSPENDED, CANCELLED, EXPIRED
        // Using a common set of statuses, gateway-specific statuses can be in metadata or mapped.
        type: String,
        required: true,
        enum: [
            'pending_approval', // PayPal specific, or Stripe's 'incomplete'
            'active',
            'trialing',
            'suspended',        // PayPal specific, or Stripe's 'past_due'/'unpaid' mapped
            'canceled',
            'expired',          // PayPal specific, or Stripe's 'ended'
            'payment_due',      // General concept for Stripe's past_due/unpaid
            'incomplete'        // Stripe specific
        ],
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
    cancelAtPeriodEnd: { // Primarily a Stripe concept
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
    }
}, { timestamps: true });

// Conditional requirement for gateway-specific IDs
userSubscriptionSchema.path('stripeSubscriptionId').required(function() {
    return this.gateway === 'Stripe';
}, 'Stripe Subscription ID is required for Stripe gateway.');

userSubscriptionSchema.path('paypalSubscriptionId').required(function() {
    return this.gateway === 'PayPal';
}, 'PayPal Subscription ID is required for PayPal gateway.');

// Indexes
userSubscriptionSchema.index({ user: 1, status: 1 });
userSubscriptionSchema.index({ user: 1, gateway: 1, status: 1 });
userSubscriptionSchema.index({ stripeSubscriptionId: 1 }, { unique: true, sparse: true }); // Ensure existing index is sparse
userSubscriptionSchema.index({ paypalSubscriptionId: 1 }, { unique: true, sparse: true });


const UserSubscription = mongoose.model('UserSubscription', userSubscriptionSchema);

module.exports = UserSubscription;
