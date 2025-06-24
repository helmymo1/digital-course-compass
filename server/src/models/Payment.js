const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    course: { // Optional, but good for context if payment is for a course
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    },
    enrollment: { // Optional, if linking directly to an enrollment
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enrollment',
    },
    amount: {
        type: Number, // Store in the main currency unit (e.g., dollars, euros)
        required: true,
    },
    amountInSmallestUnit: { // e.g., cents, if amount is in dollars
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
        uppercase: true,
    },
    paymentGateway: {
        type: String,
        required: true,
        enum: ['Stripe', 'PayPal', 'Other'], // Add other gateways as needed
    },
    transactionId: { // ID from the payment gateway (e.g., Stripe PaymentIntent ID, PayPal Order ID)
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: [
            'pending',          // Payment initiated but not confirmed
            'succeeded',        // Payment successful
            'failed',           // Payment failed
            'requires_action',  // Payment requires further action (e.g., 3D Secure)
            'processing',       // Payment is being processed
            'canceled',         // Payment was canceled
            'refunded',         // Payment was fully refunded
            'partially_refunded'// Payment was partially refunded
        ],
        default: 'pending',
    },
    gatewayResponse: { // Store raw response or key details from the gateway for debugging/auditing
        type: mongoose.Schema.Types.Mixed,
    },
    metadata: { // Any additional custom data
        type: mongoose.Schema.Types.Mixed,
    },
}, { timestamps: true });

// Index for common queries
paymentSchema.index({ user: 1, paymentStatus: 1 });
paymentSchema.index({ course: 1 });
paymentSchema.index({ enrollment: 1 });


const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
