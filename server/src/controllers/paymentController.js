// server/src/controllers/paymentController.js
const Stripe = require('stripe');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User'); // Might be needed if we store customer IDs

// Initialize Stripe with the secret key
// Ensure STRIPE_SECRET_KEY is set in your .env file
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create a Stripe Payment Intent
// @route   POST /api/v1/payments/create-payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
    const { enrollmentId } = req.body;
    const userId = req.user.id;

    if (!enrollmentId) {
        return res.status(400).json({ success: false, message: 'Enrollment ID is required.' });
    }

    try {
        // 1. Fetch the enrollment and ensure it's pending payment and belongs to the user
        const enrollment = await Enrollment.findOne({ _id: enrollmentId, user: userId, status: 'pending_payment' }).populate('course');

        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Pending enrollment not found or does not belong to user.' });
        }

        const course = enrollment.course;
        if (!course) {
            // Should not happen if DB integrity is maintained
            return res.status(404).json({ success: false, message: 'Course associated with enrollment not found.' });
        }

        if (!course.price || course.price <= 0) {
            return res.status(400).json({ success: false, message: 'This course is free or has no price defined for payment.' });
        }

        // 2. Amount for Stripe (in smallest currency unit, e.g., cents)
        // Assuming course.price is in dollars, convert to cents.
        // TODO: Make currency configurable or infer from course/settings. Defaulting to 'usd'.
        const amountInCents = Math.round(course.price * 100);
        const currency = 'usd'; // Consider making this dynamic based on course or global settings

        // 3. Get or Create Stripe Customer
        // It's good practice to create a Stripe Customer object for your user.
        // This allows you to associate multiple payments with the same customer.
        // We can store the Stripe Customer ID on our User model.
        let stripeCustomerId = req.user.stripeCustomerId; // Assuming User model has 'stripeCustomerId'

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: req.user.email,
                name: req.user.name,
                metadata: {
                    userId: req.user.id,
                }
            });
            stripeCustomerId = customer.id;
            // Save the stripeCustomerId to the user model
            await User.findByIdAndUpdate(userId, { stripeCustomerId });
        }

        // 4. Create Payment Intent
        // Check if a payment intent already exists for this enrollment to avoid duplicates
        let paymentIntent;
        if (enrollment.paymentId) {
            try {
                paymentIntent = await stripe.paymentIntents.retrieve(enrollment.paymentId);
                // If PI is still requires_payment_method or requires_confirmation, can reuse.
                // If succeeded, or processing, then something is off.
                if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing') {
                     return res.status(400).json({ success: false, message: 'Payment for this enrollment is already processing or succeeded.' });
                }
                // If it can be updated (e.g. amount changed, though not applicable here yet)
                // For now, if it exists and not succeeded/processing, we can return it.
                // Or, create a new one if certain conditions are met (e.g. old one expired)
                // Simplification: if it exists and not succeeded/processing, we'll return its client_secret
                 if (paymentIntent.status === 'requires_payment_method' || paymentIntent.status === 'requires_confirmation') {
                    // Potentially update if necessary, e.g. amount changed (not in this flow)
                    // For now, just return it
                 } else {
                    // Create a new one if the old one is in a state that can't be reused (e.g. canceled)
                    paymentIntent = null; // Force creation of a new one
                 }

            } catch (error) {
                // If retrieve fails (e.g. PI deleted or invalid), create a new one
                console.warn("Could not retrieve existing payment intent, creating a new one:", error.message);
                paymentIntent = null;
            }
        }


        if (!paymentIntent) {
            paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: currency,
                customer: stripeCustomerId,
                metadata: {
                    enrollmentId: enrollment.id,
                    courseId: course.id.toString(),
                    userId: userId,
                    courseTitle: course.title
                },
                // payment_method_types: ['card'], // Optional: specify payment method types
                description: `Enrollment in course: ${course.title}`,
            });
            // Save the paymentIntent ID on the enrollment
            enrollment.paymentId = paymentIntent.id;
            await enrollment.save();
        }


        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            enrollmentId: enrollment.id
        });

    } catch (error) {
        console.error('Create Payment Intent Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create payment intent.', error: error.message });
    }
};

// @desc    Handle Stripe Webhook events
// @route   POST /api/v1/payments/webhook
// @access  Public (but verified by Stripe signature)
exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    // Ensure STRIPE_WEBHOOK_SECRET is set in your .env file
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (!webhookSecret) {
        console.error('Stripe webhook secret is not configured.');
        return res.status(500).send('Webhook secret not configured.');
    }
    if (!sig) {
        console.warn('No Stripe signature found in webhook request.');
        return res.status(400).send('No signature.');
    }
    if (!req.body) {
        console.warn('No body found in webhook request.');
        return res.status(400).send('No body.');
    }


    try {
        // req.body is the raw body, thanks to express.raw() in paymentRoutes.js
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntentSucceeded = event.data.object;
            console.log('PaymentIntent was successful!', paymentIntentSucceeded);

            const enrollmentId = paymentIntentSucceeded.metadata.enrollmentId;
            const courseId = paymentIntentSucceeded.metadata.courseId; // For logging or additional checks
            const userId = paymentIntentSucceeded.metadata.userId; // For logging or additional checks

            if (!enrollmentId) {
                console.error('Webhook Error: Missing enrollmentId in PaymentIntent metadata for payment_intent.succeeded');
                // Still return 200 to Stripe to acknowledge receipt, but log the error.
                return res.status(200).json({ received: true, error: 'Missing enrollmentId metadata' });
            }

            try {
                const enrollment = await Enrollment.findById(enrollmentId);
                if (!enrollment) {
                    console.error(`Webhook Error: Enrollment not found with ID: ${enrollmentId} for PaymentIntent ID: ${paymentIntentSucceeded.id}`);
                    return res.status(200).json({ received: true, error: 'Enrollment not found' });
                }

                // Idempotency: Only update if status is not already 'active'
                if (enrollment.status !== 'active') {
                    enrollment.status = 'active';
                    enrollment.paymentId = paymentIntentSucceeded.id; // Ensure it's the final PI id.
                    await enrollment.save();
                    console.log(`Enrollment ${enrollmentId} successfully activated for user ${userId} in course ${courseId}.`);

                    // TODO: Optionally, send a confirmation email to the user here.
                    // await sendEmail({ to: user.email, subject: 'Enrollment Confirmed', ...});
                } else {
                    console.log(`Enrollment ${enrollmentId} was already active. Webhook for PI ${paymentIntentSucceeded.id} received.`);
                }

            } catch (dbError) {
                console.error(`Webhook DB Error: Failed to update enrollment ${enrollmentId} for PI ${paymentIntentSucceeded.id}:`, dbError);
                // Don't send 500 to Stripe if it's a DB issue on our end, they'll retry.
                // If it's a temporary issue, retrying might be fine. If permanent, needs investigation.
                // For critical errors, consider sending 500 to have Stripe retry or investigate.
                // For now, acknowledging to prevent excessive retries on persistent DB errors.
                return res.status(200).json({ received: true, error: 'Database update failed after payment success.' });
            }
            break;

        case 'payment_intent.payment_failed':
            const paymentIntentFailed = event.data.object;
            console.log('PaymentIntent failed.', paymentIntentFailed);
            const failedEnrollmentId = paymentIntentFailed.metadata.enrollmentId;
            if (failedEnrollmentId) {
                // Optionally, update enrollment status to 'payment_failed' or notify user.
                const enrollment = await Enrollment.findById(failedEnrollmentId);
                if (enrollment && enrollment.status === 'pending_payment') {
                     // enrollment.status = 'payment_failed'; // Or some other status
                     // await enrollment.save();
                     console.log(`Payment failed for enrollment ${failedEnrollmentId}. Current status: ${enrollment.status}`);
                     // TODO: Notify user about payment failure.
                }
            } else {
                 console.error('Webhook Error: Missing enrollmentId in PaymentIntent metadata for payment_intent.payment_failed');
            }
            break;

        // ... handle other event types as needed
        // e.g., 'charge.succeeded', 'customer.subscription.created', etc.

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
};
