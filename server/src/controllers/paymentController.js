// server/src/controllers/paymentController.js
const Stripe = require('stripe');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const Payment = require('../models/Payment');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const UserSubscription = require('../models/UserSubscription');

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// PayPal Configuration
const paypalSDK = require('@paypal/paypal-server-sdk');
let paypalClient;
if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
    const Environment = process.env.PAYPAL_MODE === 'live'
        ? paypalSDK.core.LiveEnvironment
        : paypalSDK.core.SandboxEnvironment;
    const environment = new Environment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
    paypalClient = new paypalSDK.core.PayPalHttpClient(environment);
    console.log(`PayPal SDK initialized in ${process.env.PAYPAL_MODE || 'sandbox'} mode.`);
} else {
    console.warn('PayPal Client ID or Secret not found. PayPal functionality will be disabled.');
}

// === STRIPE ONE-TIME PAYMENT ===
exports.createPaymentIntent = async (req, res) => {
// === STRIPE ONE-TIME PAYMENT ===
exports.createPaymentIntent = async (req, res) => {
    const { enrollmentId, couponCode } = req.body;
    const userId = req.user.id;

    if (!enrollmentId) {
        return res.status(400).json({ success: false, message: 'Enrollment ID is required.' });
    }
    try {
        const enrollment = await Enrollment.findOne({ _id: enrollmentId, user: userId, status: 'pending_payment' }).populate('course');
        if (!enrollment) return res.status(404).json({ success: false, message: 'Pending enrollment not found or does not belong to user.' });

        const course = enrollment.course;
        if (!course) return res.status(404).json({ success: false, message: 'Course associated with enrollment not found.' });
        if (!course.price || course.price <= 0) return res.status(400).json({ success: false, message: 'This course is free or has no price defined for payment.' });

        const amountInCents = Math.round(course.price * 100);
        const currency = 'usd';
        let stripeCustomerId = req.user.stripeCustomerId;
        if (!stripeCustomerId) {
            const customerData = { email: req.user.email, name: req.user.name, metadata: { userId: req.user.id.toString() }};
            const customer = await stripe.customers.create(customerData);
            stripeCustomerId = customer.id;
            await User.findByIdAndUpdate(userId, { stripeCustomerId });
        }

        let paymentIntent;
        let paymentRecord;

        if (enrollment.paymentId) {
            try {
                paymentIntent = await stripe.paymentIntents.retrieve(enrollment.paymentId);
                if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing') {
                     return res.status(400).json({ success: false, message: 'Payment for this enrollment is already processing or succeeded.' });
                }
                if (paymentIntent.status !== 'requires_payment_method' && paymentIntent.status !== 'requires_confirmation' && paymentIntent.status !== 'requires_action') {
                    paymentIntent = null;
                }
            } catch (error) { console.warn("Error retrieving PI:", error.message); paymentIntent = null; }
        }

        if (!paymentIntent) {
            paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents, currency, customer: stripeCustomerId,
                metadata: { enrollmentId: enrollment.id.toString(), courseId: course.id.toString(), userId: userId.toString(), courseTitle: course.title },
                description: `Enrollment in course: ${course.title}`,
            });
            paymentRecord = new Payment({
                user: userId, course: course.id, enrollment: enrollment.id, amount: course.price, amountInSmallestUnit: amountInCents,
                currency: currency.toUpperCase(), paymentGateway: 'Stripe', transactionId: paymentIntent.id,
                paymentStatus: paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_confirmation' ? 'requires_action' : 'pending',
                metadata: { stripeCustomerId, description: paymentIntent.description }
            });
            await paymentRecord.save();
            await stripe.paymentIntents.update(paymentIntent.id, { metadata: { ...paymentIntent.metadata, paymentDbId: paymentRecord._id.toString() }});
            enrollment.paymentId = paymentIntent.id;
            await enrollment.save();
        } else {
            paymentRecord = await Payment.findOne({ transactionId: paymentIntent.id });
            if (!paymentRecord) {
                paymentRecord = new Payment({ user: userId, course: course.id, enrollment: enrollment.id, amount: course.price, amountInSmallestUnit: amountInCents, currency: currency.toUpperCase(), paymentGateway: 'Stripe', transactionId: paymentIntent.id, paymentStatus: 'pending', metadata: { stripeCustomerId, description: paymentIntent.description, retrievedPI: true } });
                await paymentRecord.save();
                console.warn(`Created missing Payment record for existing PI ${paymentIntent.id}`);
                 if (!paymentIntent.metadata.paymentDbId || paymentIntent.metadata.paymentDbId !== paymentRecord._id.toString()) {
                   await stripe.paymentIntents.update(paymentIntent.id, { metadata: { ...paymentIntent.metadata, paymentDbId: paymentRecord._id.toString() }});
                }
            }
            const expectedStatus = paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_confirmation' ? 'requires_action' : (paymentIntent.status === 'succeeded' ? 'succeeded' : (paymentIntent.status === 'processing' ? 'processing' : 'pending'));
            if (paymentRecord && paymentRecord.paymentStatus !== expectedStatus) {
                paymentRecord.paymentStatus = expectedStatus;
                await paymentRecord.save();
            }
        }
        res.status(200).json({
            success: true, clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id,
            enrollmentId: enrollment.id.toString(), paymentDbId: paymentRecord ? paymentRecord._id.toString() : null
        });
    } catch (error) { console.error('Create Payment Intent Error:', error); res.status(500).json({ success: false, message: 'Failed to create payment intent.', error: error.message }); }
};

// === STRIPE SUBSCRIPTIONS ===
exports.createStripeSubscription = async (req, res) => {
    const { planId, paymentMethodId } = req.body;
    const userId = req.user.id;
    if (!planId) return res.status(400).json({ success: false, message: 'Plan ID is required.' });
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        let stripeCustomerId = user.stripeCustomerId;
        if (!stripeCustomerId) {
            const customerParams = { email: user.email, name: user.name, metadata: { userId: user._id.toString() }};
            if (paymentMethodId) { customerParams.payment_method = paymentMethodId; customerParams.invoice_settings = { default_payment_method: paymentMethodId };}
            const customer = await stripe.customers.create(customerParams);
            stripeCustomerId = customer.id; user.stripeCustomerId = stripeCustomerId; await user.save();
        } else if (paymentMethodId) {
            try {
                await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId });
                await stripe.customers.update(stripeCustomerId, { invoice_settings: { default_payment_method: paymentMethodId }});
            } catch (attachError) { console.warn(`Could not attach PM ${paymentMethodId} to customer ${stripeCustomerId}: ${attachError.message}.`);}
        }
        const subscriptionPlan = await SubscriptionPlan.findById(planId);
        if (!subscriptionPlan || !subscriptionPlan.isActive || !subscriptionPlan.stripePriceId) return res.status(404).json({ success: false, message: 'Active Stripe subscription plan not found.' });
        const { stripePriceId, trialPeriodDays } = subscriptionPlan;
        const existingUserSubscription = await UserSubscription.findOne({ user: userId, gateway: 'Stripe', status: { $in: ['active', 'trialing', 'past_due', 'incomplete'] }});
        if (existingUserSubscription) return res.status(400).json({ success: false, message: `User already has a Stripe subscription (ID: ${existingUserSubscription.stripeSubscriptionId}) with status: ${existingUserSubscription.status}.`});

        const subscriptionParams = {
            customer: stripeCustomerId, items: [{ price: stripePriceId }], payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent', 'pending_setup_intent'], metadata: { userId: userId.toString(), planId: planId.toString(), dbUserSubscriptionId: '' }
        };
        if (trialPeriodDays && trialPeriodDays > 0) subscriptionParams.trial_period_days = trialPeriodDays;
        subscriptionParams.payment_settings = { save_default_payment_method: 'on_subscription' };
        const stripeSubscription = await stripe.subscriptions.create(subscriptionParams);
        const latestInvoiceId = stripeSubscription.latest_invoice ? (typeof stripeSubscription.latest_invoice === 'string' ? stripeSubscription.latest_invoice : stripeSubscription.latest_invoice.id) : null;
        const newUserSubscription = new UserSubscription({
            user: userId, plan: planId, gateway: 'Stripe', stripeSubscriptionId: stripeSubscription.id,
            gatewayCustomerId: stripeCustomerId, gatewayPriceOrPlanId: stripePriceId, status: stripeSubscription.status,
            currentPeriodStart: stripeSubscription.current_period_start ? new Date(stripeSubscription.current_period_start * 1000) : null,
            currentPeriodEnd: stripeSubscription.current_period_end ? new Date(stripeSubscription.current_period_end * 1000) : null,
            trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
            trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end, metadata: { latest_invoice_id: latestInvoiceId }
        });
        await newUserSubscription.save();
        await stripe.subscriptions.update(stripeSubscription.id, { metadata: { ...stripeSubscription.metadata, dbUserSubscriptionId: newUserSubscription._id.toString() }});
        let clientSecret = null, setupIntentClientSecret = null;
        if (stripeSubscription.status === 'incomplete' && stripeSubscription.latest_invoice?.payment_intent) clientSecret = stripeSubscription.latest_invoice.payment_intent.client_secret;
        else if (stripeSubscription.pending_setup_intent) setupIntentClientSecret = stripeSubscription.pending_setup_intent.client_secret;
        res.status(201).json({
            success: true, message: `Subscription created with status: ${stripeSubscription.status}.`, stripeSubscriptionId: stripeSubscription.id,
            userSubscriptionId: newUserSubscription._id, status: stripeSubscription.status, clientSecret, setupIntentClientSecret, subscriptionDetails: newUserSubscription
        });
    } catch (error) { console.error('Create Stripe Subscription Error:', error); res.status(500).json({ success: false, message: 'Failed to create Stripe subscription.', error: error.message }); }
};

exports.cancelStripeSubscription = async (req, res) => {
    const { userSubscriptionId } = req.body; const userId = req.user.id;
    if (!userSubscriptionId) return res.status(400).json({ success: false, message: 'User Subscription ID is required.' });
    try {
        const userSubscription = await UserSubscription.findOne({ _id: userSubscriptionId, user: userId, gateway: 'Stripe' });
        if (!userSubscription) return res.status(404).json({ success: false, message: 'Stripe subscription not found.' });
        if (userSubscription.status === 'canceled' || userSubscription.cancelAtPeriodEnd) return res.status(400).json({ success: false, message: 'Subscription already canceled or set to cancel.'});
        const stripeSubscription = await stripe.subscriptions.update(userSubscription.stripeSubscriptionId, { cancel_at_period_end: true });
        userSubscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
        userSubscription.status = stripeSubscription.status;
        if (stripeSubscription.canceled_at) userSubscription.canceledAt = new Date(stripeSubscription.canceled_at * 1000);
        if(!userSubscription.metadata) userSubscription.metadata = {}; userSubscription.metadata.cancellation_requested_at = new Date();
        await userSubscription.save();
        res.status(200).json({ success: true, message: `Subscription scheduled to cancel at period end.`, status: stripeSubscription.status });
    } catch (error) { console.error('Cancel Stripe Subscription Error:', error); res.status(500).json({ success: false, message: 'Failed to cancel Stripe subscription.', error: error.message });}
};

// === PAYPAL ONE-TIME PAYMENT ===
exports.createPaypalOrder = async (req, res) => {
    if (!paypalClient) return res.status(500).json({ success: false, message: 'PayPal client is not configured.' });
    const { enrollmentId } = req.body; const userId = req.user.id;
    if (!enrollmentId) return res.status(400).json({ success: false, message: 'Enrollment ID is required.' });
    try {
        const enrollment = await Enrollment.findOne({ _id: enrollmentId, user: userId, status: 'pending_payment' }).populate('course');
        if (!enrollment) return res.status(404).json({ success: false, message: 'Pending enrollment not found.' });
        const course = enrollment.course;
        if (!course || !course.price || course.price <= 0) return res.status(400).json({ success: false, message: 'Course price is invalid.' });
        const currencyCode = 'USD'; const coursePrice = course.price.toFixed(2);
        const request = new paypalSDK.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: { currency_code: currencyCode, value: coursePrice, breakdown: { item_total: { currency_code: currencyCode, value: coursePrice }}},
                items: [{ name: course.title.substring(0, 127), unit_amount: { currency_code: currencyCode, value: coursePrice }, quantity: '1', sku: course._id.toString(), category: 'DIGITAL_GOODS' }],
                description: `Enrollment: ${course.title}`.substring(0,127), custom_id: enrollment._id.toString(),
            }],
            application_context: { return_url: `${process.env.FRONTEND_URL}/payment/paypal/success`, cancel_url: `${process.env.FRONTEND_URL}/payment/paypal/cancel`, brand_name: process.env.BRAND_NAME || 'YourLMS', shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW'}
        });
        const paypalOrder = await paypalClient.execute(request);
        const paymentRecord = new Payment({
            user: userId, course: course._id, enrollment: enrollment._id, amount: parseFloat(coursePrice), amountInSmallestUnit: Math.round(parseFloat(coursePrice) * 100),
            currency: currencyCode, paymentGateway: 'PayPal', transactionId: paypalOrder.result.id, paymentStatus: 'CREATED', gatewayResponse: paypalOrder.result,
            metadata: { enrollmentId: enrollment._id.toString(), courseId: course._id.toString(), userId: userId.toString(), approval_links: paypalOrder.result.links }
        });
        await paymentRecord.save();
        enrollment.paymentId = paypalOrder.result.id; await enrollment.save();
        const approvalLink = paypalOrder.result.links.find(link => link.rel === 'approve');
        res.status(201).json({ success: true, paypalOrderId: paypalOrder.result.id, approvalLink: approvalLink?.href, paymentDbId: paymentRecord._id.toString() });
    } catch (error) { console.error('Create PayPal Order Error:', error); res.status(500).json({ success: false, message: 'Failed to create PayPal order.', error: error.message }); }
};
exports.capturePaypalOrder = async (req, res) => {
    if (!paypalClient) return res.status(500).json({ success: false, message: 'PayPal client not configured.'});
    const { paypalOrderId } = req.params; const userId = req.user.id;
    try {
        const paymentRecord = await Payment.findOne({ transactionId: paypalOrderId, user: userId, paymentGateway: 'PayPal' });
        if (!paymentRecord) return res.status(404).json({ success: false, message: 'Payment record not found.' });
        if (paymentRecord.paymentStatus === 'succeeded') return res.status(200).json({ success: true, message: 'Payment already captured.', payment: paymentRecord });
        const request = new paypalSDK.orders.OrdersCaptureRequest(paypalOrderId); request.requestBody({});
        const capture = await paypalClient.execute(request); const captureResult = capture.result;
        paymentRecord.paymentStatus = 'succeeded'; paymentRecord.gatewayResponse = captureResult;
        if (captureResult.purchase_units?.[0]?.payments?.captures?.[0]) {
            if (!paymentRecord.metadata) paymentRecord.metadata = {};
            paymentRecord.metadata.paypalCaptureId = captureResult.purchase_units[0].payments.captures[0].id;
        }
        await paymentRecord.save();
        if (paymentRecord.enrollment) {
            const enrollment = await Enrollment.findById(paymentRecord.enrollment);
            if (enrollment && enrollment.status !== 'active') { enrollment.status = 'active'; await enrollment.save(); }
        }
        res.status(200).json({ success: true, message: 'PayPal payment captured.', paypalCaptureResult: captureResult, payment: paymentRecord });
    } catch (error) { console.error('Capture PayPal Order Error:', error); res.status(500).json({ success: false, message: 'Failed to capture PayPal order.', error: error.message });}
 };

// === PAYPAL SUBSCRIPTIONS ===
exports.createPaypalSubscription = async (req, res) => {
    if (!paypalClient) return res.status(500).json({ success: false, message: 'PayPal client is not configured.' });
    const { planId } = req.body; const userId = req.user.id;
    if (!planId) return res.status(400).json({ success: false, message: 'Plan ID is required.' });
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        const subscriptionPlan = await SubscriptionPlan.findById(planId);
        if (!subscriptionPlan || !subscriptionPlan.isActive || !subscriptionPlan.paypalPlanId) return res.status(404).json({ success: false, message: 'Active PayPal plan not found.' });
        const existingSub = await UserSubscription.findOne({ user: userId, gateway: 'PayPal', status: { $in: ['active', 'trialing', 'pending_approval', 'suspended'] }});
        if (existingSub) return res.status(400).json({ success: false, message: `User already has PayPal subscription: ${existingSub.status}`});
        const request = new paypalSDK.subscriptions.SubscriptionsCreateRequest();
        request.requestBody({
            plan_id: subscriptionPlan.paypalPlanId, custom_id: userId.toString(), quantity: '1',
            subscriber: { name: { given_name: user.name.split(' ')[0] || 'Customer', surname: user.name.split(' ').slice(1).join(' ') || 'User' }, email_address: user.email },
            application_context: { brand_name: process.env.BRAND_NAME || 'YourLMS', locale: 'en-US', shipping_preference: 'NO_SHIPPING', user_action: 'SUBSCRIBE_NOW', return_url: `${process.env.FRONTEND_URL}/payment/paypal/subscription/success`, cancel_url: `${process.env.FRONTEND_URL}/payment/paypal/subscription/cancel`}
        });
        const paypalSubscriptionResponse = await paypalClient.execute(request); const paypalSubscriptionDetail = paypalSubscriptionResponse.result;
        const newUserSubscription = new UserSubscription({
            user: userId, plan: planId, gateway: 'PayPal', paypalSubscriptionId: paypalSubscriptionDetail.id,
            gatewayCustomerId: paypalSubscriptionDetail.subscriber?.payer_id, gatewayPriceOrPlanId: subscriptionPlan.paypalPlanId, status: 'pending_approval',
            metadata: { paypalSubscriptionCreateResponse: paypalSubscriptionDetail, approval_links: paypalSubscriptionDetail.links }
        });
        await newUserSubscription.save();
        const approvalLink = paypalSubscriptionDetail.links.find(link => link.rel === 'approve');
        res.status(201).json({ success: true, message: 'PayPal subscription created. Awaiting approval.', paypalSubscriptionId: paypalSubscriptionDetail.id, userSubscriptionId: newUserSubscription._id, status: newUserSubscription.status, approvalLink: approvalLink?.href, subscriptionDetails: newUserSubscription });
    } catch (error) { console.error('Create PayPal Subscription Error:', error); res.status(500).json({ success: false, message: 'Failed to create PayPal subscription.', error: error.message });}
};
exports.cancelPaypalSubscription = async (req, res) => {
    if (!paypalClient) return res.status(500).json({ success: false, message: 'PayPal client is not configured.' });
    const { userSubscriptionId } = req.body; const userId = req.user.id;
    if (!userSubscriptionId) return res.status(400).json({ success: false, message: 'Subscription ID required.' });
    try {
        const userSubscription = await UserSubscription.findOne({ _id: userSubscriptionId, user: userId, gateway: 'PayPal' });
        if (!userSubscription) return res.status(404).json({ success: false, message: 'PayPal subscription not found.' });
        if (userSubscription.status === 'canceled' || userSubscription.status === 'expired') return res.status(400).json({ success: false, message: 'Subscription already canceled/expired.'});
        const reason = req.body.reason || 'User requested cancellation.';
        const request = new paypalSDK.subscriptions.SubscriptionsCancelRequest(userSubscription.paypalSubscriptionId);
        request.requestBody({ reason });
        await paypalClient.execute(request);
        userSubscription.status = 'canceled'; userSubscription.canceledAt = new Date();
        if (!userSubscription.metadata) userSubscription.metadata = {};
        userSubscription.metadata.cancellation_reason = reason; userSubscription.metadata.cancellation_processed_at = new Date();
        await userSubscription.save();
        res.status(200).json({ success: true, message: `PayPal subscription ${userSubscription.paypalSubscriptionId} canceled.`, status: userSubscription.status });
    } catch (error) { console.error('Cancel PayPal Subscription Error:', error); res.status(500).json({ success: false, message: 'Failed to cancel PayPal subscription.', error: error.message });}
 };

// === REFUND PROCESSING ===

// @desc    Create a Stripe Refund
// @route   POST /api/v1/payments/stripe/create-refund
// @access  Private (typically Admin or privileged user)
exports.createStripeRefund = async (req, res) => {
    const { paymentDbId, amount, reason } = req.body;
    // userId = req.user.id; // Assuming admin/privileged user check is done via middleware

    if (!paymentDbId) {
        return res.status(400).json({ success: false, message: 'Payment ID is required for refund.' });
    }

    try {
        const paymentRecord = await Payment.findById(paymentDbId);

        if (!paymentRecord) {
            return res.status(404).json({ success: false, message: 'Payment record not found.' });
        }

        if (paymentRecord.paymentGateway !== 'Stripe') {
            return res.status(400).json({ success: false, message: 'This payment was not made through Stripe.' });
        }

        if (paymentRecord.paymentStatus === 'refunded') {
            return res.status(400).json({ success: false, message: 'Payment already fully refunded.' });
        }
        // Allow refund attempts on 'succeeded' or 'partially_refunded'
        if (paymentRecord.paymentStatus !== 'succeeded' && paymentRecord.paymentStatus !== 'partially_refunded') {
             return res.status(400).json({ success: false, message: `Payment status is ${paymentRecord.paymentStatus}, not eligible for refund.` });
        }

        const refundParams = {
            payment_intent: paymentRecord.transactionId,
        };

        let amountToRefundInSmallestUnit = 0;
        const alreadyRefunded = paymentRecord.metadata?.totalRefundedAmountInSmallestUnit || 0;

        if (amount) {
            amountToRefundInSmallestUnit = Math.round(parseFloat(amount) * 100);
            if (amountToRefundInSmallestUnit <= 0) {
                return res.status(400).json({ success: false, message: 'Refund amount must be positive.' });
            }
            if ((amountToRefundInSmallestUnit + alreadyRefunded) > paymentRecord.amountInSmallestUnit) {
                 return res.status(400).json({ success: false, message: 'Refund amount exceeds refundable amount.' });
            }
            refundParams.amount = amountToRefundInSmallestUnit;
        } else {
            // Full refund of the remaining amount
            amountToRefundInSmallestUnit = paymentRecord.amountInSmallestUnit - alreadyRefunded;
            if (amountToRefundInSmallestUnit <= 0 && paymentRecord.paymentStatus !== 'partially_refunded') { // allow 0 if it's to complete partials
                 return res.status(400).json({ success: false, message: 'No amount remaining to refund or payment not partially refunded prior.' });
            }
            // No need to set refundParams.amount for full refund of remainder if it's the total original amount
            // However, if it's a partial refund making it full, we specify the remaining amount.
            if (alreadyRefunded > 0) {
                 refundParams.amount = amountToRefundInSmallestUnit;
            }
        }

        if (reason) {
            refundParams.reason = reason;
        }

        console.log("Attempting Stripe refund with params:", refundParams);
        const refund = await stripe.refunds.create(refundParams);
        console.log(`Stripe refund object created: ${refund.id}, status: ${refund.status}`);

        if (!paymentRecord.metadata) paymentRecord.metadata = {};
        if (!paymentRecord.metadata.refundAttempts) paymentRecord.metadata.refundAttempts = [];
        paymentRecord.metadata.refundAttempts.push({
            refundId: refund.id,
            amount: refund.amount,
            status: refund.status,
            requestedAt: new Date(),
            reason: reason || null
        });

        if(refund.status === 'succeeded'){
            paymentRecord.metadata.totalRefundedAmountInSmallestUnit = (paymentRecord.metadata.totalRefundedAmountInSmallestUnit || 0) + refund.amount;
            if (paymentRecord.metadata.totalRefundedAmountInSmallestUnit >= paymentRecord.amountInSmallestUnit) {
                paymentRecord.paymentStatus = 'refunded';
            } else {
                paymentRecord.paymentStatus = 'partially_refunded';
            }
        }

        await paymentRecord.save();

        res.status(200).json({
            success: true,
            message: `Stripe refund request processed. Stripe Refund ID: ${refund.id}, Status: ${refund.status}.`,
            stripeRefundId: refund.id,
            stripeRefundStatus: refund.status,
            paymentDbId: paymentRecord._id,
            updatedPaymentStatus: paymentRecord.paymentStatus
        });

    } catch (error) {
        console.error('Create Stripe Refund Error:', error);
        if (error.type === 'StripeInvalidRequestError' && error.code === 'charge_already_refunded') {
            const paymentToUpdate = await Payment.findById(paymentDbId);
            if (paymentToUpdate && paymentToUpdate.paymentStatus !== 'refunded') {
                paymentToUpdate.paymentStatus = 'refunded';
                if(!paymentToUpdate.metadata) paymentToUpdate.metadata = {};
                paymentToUpdate.metadata.totalRefundedAmountInSmallestUnit = paymentToUpdate.amountInSmallestUnit;
                await paymentToUpdate.save();
                console.log(`Payment ${paymentDbId} confirmed as already refunded by Stripe, local status updated.`);
            }
             return res.status(400).json({ success: false, message: 'Charge has already been fully refunded on Stripe.', code: error.code });
        }
        res.status(500).json({ success: false, message: 'Failed to process Stripe refund.', error: error.message });
    }
};

// @desc    Update/Change a user's Stripe Subscription Plan (Upgrade/Downgrade)
// @route   POST /api/v1/payments/stripe/update-subscription-plan
// @access  Private
exports.updateStripeSubscriptionPlan = async (req, res) => {
    const { userSubscriptionId, newPlanId } = req.body; // our UserSubscription DB ID, and new SubscriptionPlan DB ID
    const userId = req.user.id;

    if (!userSubscriptionId || !newPlanId) {
        return res.status(400).json({ success: false, message: 'User Subscription ID and New Plan ID are required.' });
    }

    try {
        const userSubscription = await UserSubscription.findOne({
            _id: userSubscriptionId,
            user: userId,
            gateway: 'Stripe'
        }).populate('plan'); // Populate the current plan details

        if (!userSubscription) {
            return res.status(404).json({ success: false, message: 'Active Stripe subscription not found for this user.' });
        }

        if (userSubscription.status !== 'active' && userSubscription.status !== 'trialing') {
            return res.status(400).json({ success: false, message: `Subscription is not active or trialing (current status: ${userSubscription.status}). Cannot change plan.` });
        }

        const newPlan = await SubscriptionPlan.findById(newPlanId);
        if (!newPlan || !newPlan.isActive || !newPlan.stripePriceId) {
            return res.status(404).json({ success: false, message: 'New subscription plan not found, is not active, or has no Stripe Price ID.' });
        }

        if (userSubscription.plan._id.toString() === newPlan._id.toString()) { // Ensure comparison is correct if plan is populated
            return res.status(400).json({ success: false, message: 'Cannot change to the same plan.' });
        }

        const currentStripeSubscription = await stripe.subscriptions.retrieve(userSubscription.stripeSubscriptionId);
        if (!currentStripeSubscription.items || currentStripeSubscription.items.data.length === 0) {
            return res.status(500).json({ success: false, message: 'Could not find items on existing Stripe subscription.' });
        }
        const currentSubscriptionItemId = currentStripeSubscription.items.data[0].id;

        const updatedStripeSubscription = await stripe.subscriptions.update(
            userSubscription.stripeSubscriptionId,
            {
                items: [{
                    id: currentSubscriptionItemId,
                    price: newPlan.stripePriceId,
                }],
                proration_behavior: 'create_prorations',
                cancel_at_period_end: false,
                metadata: {
                    ...currentStripeSubscription.metadata,
                    dbUserSubscriptionId: userSubscription._id.toString(), // Ensure our DB ID is in metadata
                    previousPlanOurId: userSubscription.plan._id.toString(),
                    newPlanOurId: newPlan._id.toString(),
                    changeType: newPlan.price > userSubscription.plan.price ? 'upgrade' : 'downgrade',
                }
            }
        );

        // Update our local UserSubscription record
        const oldPlanId = userSubscription.plan._id; // Keep old plan id for history before updating
        userSubscription.plan = newPlan._id;
        userSubscription.gatewayPriceOrPlanId = newPlan.stripePriceId; // Update to new Stripe Price ID
        userSubscription.status = updatedStripeSubscription.status;
        userSubscription.currentPeriodStart = new Date(updatedStripeSubscription.current_period_start * 1000);
        userSubscription.currentPeriodEnd = new Date(updatedStripeSubscription.current_period_end * 1000);
        userSubscription.trialStart = updatedStripeSubscription.trial_start ? new Date(updatedStripeSubscription.trial_start * 1000) : null;
        userSubscription.trialEnd = updatedStripeSubscription.trial_end ? new Date(updatedStripeSubscription.trial_end * 1000) : null;
        userSubscription.cancelAtPeriodEnd = updatedStripeSubscription.cancel_at_period_end;

        if (!userSubscription.metadata) userSubscription.metadata = {};
        userSubscription.metadata.latest_invoice_id = updatedStripeSubscription.latest_invoice
            ? (typeof updatedStripeSubscription.latest_invoice === 'string' ? updatedStripeSubscription.latest_invoice : updatedStripeSubscription.latest_invoice.id)
            : userSubscription.metadata.latest_invoice_id;

        if (!userSubscription.metadata.planChangeHistory) userSubscription.metadata.planChangeHistory = [];
        userSubscription.metadata.planChangeHistory.push({
            fromPlan: oldPlanId.toString(),
            toPlan: newPlan._id.toString(),
            changedAt: new Date(),
            stripeApiResponseStatus: updatedStripeSubscription.status
        });

        await userSubscription.save();

        res.status(200).json({
            success: true,
            message: `Subscription successfully changed to plan: ${newPlan.name}.`,
            newStripeStatus: updatedStripeSubscription.status,
            userSubscriptionData: userSubscription // Send back the updated local record
        });

    } catch (error) {
        console.error('Update Stripe Subscription Plan Error:', error);
         if (error.type === 'StripeInvalidRequestError' || error.type === 'StripeAPIError' || error.type === 'StripeCardError') {
            return res.status(400).json({ success: false, message: `Stripe Error: ${error.message}`, type: error.type });
        }
        res.status(500).json({ success: false, message: 'Failed to update Stripe subscription plan.', error: error.message });
    }
};

// @desc    Get a user's payment history
// @route   GET /api/v1/payments/history
// @access  Private
exports.getUserPaymentHistory = async (req, res) => {
    const userId = req.user.id;
    // Basic pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    try {
        const payments = await Payment.find({ user: userId })
            .sort({ createdAt: -1 }) // Show newest first
            .skip(skip)
            .limit(limit)
            .populate('course', 'title')
            .populate({ // Populate plan details through the subscription
                path: 'subscription',
                select: 'plan status gatewayPriceOrPlanId', // Select specific fields from UserSubscription
                populate: {
                    path: 'plan', // Populate the plan field within UserSubscription
                    select: 'name price currency interval' // Select specific fields from SubscriptionPlan
                }
            });

        const totalPayments = await Payment.countDocuments({ user: userId });

        // Sanitize what is returned, especially gatewayResponse
        const sanitizedPayments = payments.map(p => {
            const paymentObject = p.toObject(); // Convert mongoose doc to plain object
            // Remove or minimize sensitive/large gateway responses
            if (paymentObject.gatewayResponse) {
                paymentObject.gatewayResponseSummary = {
                    id: paymentObject.gatewayResponse.id,
                    status: paymentObject.gatewayResponse.status || paymentObject.gatewayResponse.state, // Stripe uses status, PayPal uses state for some objects
                    // Add other key summary fields if needed
                };
                delete paymentObject.gatewayResponse; // Remove the large raw object
            }
             if (paymentObject.metadata?.paypalSubscriptionCreateResponse) { // Clean up large PayPal create responses
                delete paymentObject.metadata.paypalSubscriptionCreateResponse;
            }
            if (paymentObject.metadata?.approval_links) {
                delete paymentObject.metadata.approval_links;
            }

            return paymentObject;
}

// Placeholder for bulk discount rules - In a real app, this might come from DB or config file
const bulkDiscountRules = [
    {
        name: "Course Discount: 2-4 (10%)",
        applicableItemType: "course",
        minQuantity: 2, maxQuantity: 4,
        discountType: "percentage", discountValue: 10,
    },
    {
        name: "Course Discount: 5+ (20%)",
        applicableItemType: "course",
        minQuantity: 5, maxQuantity: Infinity,
        discountType: "percentage", discountValue: 20,
    }
];

async function applyBulkDiscounts(currentCartTotal, items, currency) {
    // items: [{ itemId, itemType, price, quantity }]
    // currentCartTotal: The total amount after any item-specific coupons, before cart-wide coupons or bulk discounts.

    let totalDiscountAmount = 0;
    let appliedRule = null;
    let finalAmount = currentCartTotal;

    const courseItems = items.filter(item => item.itemType === 'course');
    const totalCourseQuantity = courseItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalCourseValue = courseItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    if (totalCourseQuantity > 0) {
        let bestRuleForCourses = null;
        for (const rule of bulkDiscountRules) {
            if (rule.applicableItemType === 'course' &&
                totalCourseQuantity >= rule.minQuantity &&
                totalCourseQuantity <= rule.maxQuantity) {
                if (!bestRuleForCourses || rule.discountValue > bestRuleForCourses.discountValue) {
                    bestRuleForCourses = rule;
                }
            }
        }

        if (bestRuleForCourses) {
            appliedRule = bestRuleForCourses;
            if (bestRuleForCourses.discountType === 'percentage') {
                totalDiscountAmount = (totalCourseValue * bestRuleForCourses.discountValue) / 100;
            }
        }
    }

    totalDiscountAmount = Math.min(totalDiscountAmount, totalCourseValue);
    finalAmount = Math.max(0, currentCartTotal - totalDiscountAmount);

    return {
        discountAmount: parseFloat(totalDiscountAmount.toFixed(2)),
        finalAmount: parseFloat(finalAmount.toFixed(2)),
        appliedBulkDiscountRule: appliedRule ? { name: appliedRule.name, value: appliedRule.discountValue, type: appliedRule.discountType } : null,
        message: appliedRule ? `Bulk discount '${appliedRule.name}' applied.` : 'No bulk discount applicable.'
    };
        });


        res.status(200).json({
            success: true,
            count: sanitizedPayments.length,
            totalRecords: totalPayments,
            totalPages: Math.ceil(totalPayments / limit),
            currentPage: page,
            data: sanitizedPayments,
        });
    } catch (error) {
        console.error('Get User Payment History Error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve payment history.', error: error.message });
    }
};

// @desc    Update/Change a user's PayPal Subscription Plan (Conceptual)
// @route   POST /api/v1/payments/paypal/update-subscription-plan
// @access  Private
exports.updatePaypalSubscriptionPlan = async (req, res) => {
    const { userSubscriptionId, newPlanId } = req.body;
    const userId = req.user.id;

    // This is a more complex flow for PayPal.
    // Option 1: Cancel & Re-subscribe (Simpler API interaction, manual proration)
    // Option 2: Use PayPal's Revise Subscription API (PATCH v1/billing/subscriptions/{id})

    console.log(`Attempt to change PayPal subscription ${userSubscriptionId} to new plan ${newPlanId} for user ${userId}.`);
    res.status(501).json({
        success: false,
        message: 'Changing PayPal subscription plan directly is complex. Recommended flow: cancel current subscription and create a new one with the desired plan. Direct update endpoint not fully implemented.',
        guidance: "Cancel current subscription, then create a new one with the desired plan."
    });
};


// === WEBHOOK HANDLERS ===

const syncSubscriptionStatusFromStripe = async (stripeSubscriptionObject) => {
    const stripeSubscriptionId = stripeSubscriptionObject.id;
    const dbUserSubscriptionId = stripeSubscriptionObject.metadata && stripeSubscriptionObject.metadata.dbUserSubscriptionId;
    let userSubscription;
    if (dbUserSubscriptionId) userSubscription = await UserSubscription.findById(dbUserSubscriptionId);
    if (!userSubscription) userSubscription = await UserSubscription.findOne({ stripeSubscriptionId, gateway: 'Stripe' });
    if (!userSubscription) {
        const userId = stripeSubscriptionObject.metadata?.userId; const planId = stripeSubscriptionObject.metadata?.planId;
        if (userId && planId) {
            const plan = await SubscriptionPlan.findById(planId);
            if (!plan) { console.error(`SyncStripe: Plan ${planId} not found.`); return null; }
            userSubscription = new UserSubscription({
                user: userId, plan: plan._id, gateway: 'Stripe', stripeSubscriptionId,
                gatewayCustomerId: stripeSubscriptionObject.customer, gatewayPriceOrPlanId: stripeSubscriptionObject.items.data[0].price.id,
                status: stripeSubscriptionObject.status,
                currentPeriodStart: stripeSubscriptionObject.current_period_start ? new Date(stripeSubscriptionObject.current_period_start * 1000) : null,
                currentPeriodEnd: stripeSubscriptionObject.current_period_end ? new Date(stripeSubscriptionObject.current_period_end * 1000) : null,
                trialStart: stripeSubscriptionObject.trial_start ? new Date(stripeSubscriptionObject.trial_start * 1000) : null,
                trialEnd: stripeSubscriptionObject.trial_end ? new Date(stripeSubscriptionObject.trial_end * 1000) : null,
                cancelAtPeriodEnd: stripeSubscriptionObject.cancel_at_period_end,
                canceledAt: stripeSubscriptionObject.canceled_at ? new Date(stripeSubscriptionObject.canceled_at * 1000) : null,
                endedAt: stripeSubscriptionObject.ended_at ? new Date(stripeSubscriptionObject.ended_at * 1000) : null,
                metadata: { latest_stripe_event_type: 'customer.subscription.created_via_webhook_sync' }
            });
            if (!dbUserSubscriptionId && userSubscription._id) {
                try {
                    await stripe.subscriptions.update(stripeSubscriptionId, { metadata: { ...stripeSubscriptionObject.metadata, dbUserSubscriptionId: userSubscription._id.toString() }});
                } catch (metaUpdateError) { console.error("Error updating stripe metadata during sync:", metaUpdateError);}
            }
        } else { console.error(`SyncStripe: UserSub not found for StripeSub ${stripeSubscriptionId}, missing metadata.`); return null; }
    }
    userSubscription.status = stripeSubscriptionObject.status;
    userSubscription.currentPeriodStart = stripeSubscriptionObject.current_period_start ? new Date(stripeSubscriptionObject.current_period_start * 1000) : userSubscription.currentPeriodStart;
    userSubscription.currentPeriodEnd = stripeSubscriptionObject.current_period_end ? new Date(stripeSubscriptionObject.current_period_end * 1000) : userSubscription.currentPeriodEnd;
    userSubscription.trialStart = stripeSubscriptionObject.trial_start ? new Date(stripeSubscriptionObject.trial_start * 1000) : userSubscription.trialStart;
    userSubscription.trialEnd = stripeSubscriptionObject.trial_end ? new Date(stripeSubscriptionObject.trial_end * 1000) : userSubscription.trialEnd;
    userSubscription.cancelAtPeriodEnd = stripeSubscriptionObject.cancel_at_period_end;
    userSubscription.canceledAt = stripeSubscriptionObject.canceled_at ? new Date(stripeSubscriptionObject.canceled_at * 1000) : userSubscription.canceledAt;
    userSubscription.endedAt = stripeSubscriptionObject.ended_at ? new Date(stripeSubscriptionObject.ended_at * 1000) : userSubscription.endedAt;
    if (!userSubscription.metadata) userSubscription.metadata = {};
    const latestInvoiceId = stripeSubscriptionObject.latest_invoice ? (typeof stripeSubscriptionObject.latest_invoice === 'string' ? stripeSubscriptionObject.latest_invoice : stripeSubscriptionObject.latest_invoice.id) : userSubscription.metadata.latest_invoice_id;
    userSubscription.metadata.latest_invoice_id = latestInvoiceId;
    await userSubscription.save();
    console.log(`UserSubscription ${userSubscription._id} (Stripe ID: ${stripeSubscriptionId}) synced by Stripe. Status: ${userSubscription.status}`);
    return userSubscription;
};

exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    if (!webhookSecret) return res.status(500).send('Stripe WH secret missing.');
    if (!sig) return res.status(400).send('No Stripe signature.');
    if (!req.body) return res.status(400).send('No body.');
    try { event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret); }
    catch (err) { console.error(`Stripe WH verify failed: ${err.message}`); return res.status(400).send(`Webhook Error: ${err.message}`);}

    const eventDataObject = event.data.object;
    let paymentRecord, userSubscription;
    console.log(`Stripe WH: Event ${event.type}, ID: ${event.id}`);
    try {
        if (event.type.startsWith('customer.subscription.')) {
            await syncSubscriptionStatusFromStripe(eventDataObject);
        } else if (event.type.startsWith('payment_intent.')) {
            const pi = eventDataObject;
            const paymentDbId = pi.metadata?.paymentDbId;
            if (paymentDbId) paymentRecord = await Payment.findById(paymentDbId);
            if (!paymentRecord) paymentRecord = await Payment.findOne({ transactionId: pi.id, paymentGateway: 'Stripe' });
            if (!paymentRecord && !pi.invoice) console.error(`Stripe WH Error: Payment record not found for non-invoice PI ${pi.id}.`);
            else if (paymentRecord) {
                 switch (event.type) {
                    case 'payment_intent.succeeded':
                        if (paymentRecord.paymentStatus !== 'succeeded') {
                            paymentRecord.paymentStatus = 'succeeded'; paymentRecord.gatewayResponse = pi;
                            await paymentRecord.save(); console.log(`Payment record ${paymentRecord._id} (PI: ${pi.id}) updated to succeeded.`);
                            const enrollmentId = pi.metadata?.enrollmentId || paymentRecord?.enrollment;
                            if (enrollmentId) {
                                const enrollment = await Enrollment.findById(enrollmentId);
                                if (enrollment && enrollment.status !== 'active') { enrollment.status = 'active'; await enrollment.save(); console.log(`Enrollment ${enrollmentId} activated.`); }
                            }
                        } else { console.log(`Stripe WH: Payment record ${paymentRecord._id} for PI ${pi.id} already succeeded.`); }
                        break;
                    case 'payment_intent.payment_failed':
                        if (paymentRecord.paymentStatus !== 'failed') { paymentRecord.paymentStatus = 'failed'; paymentRecord.gatewayResponse = pi; await paymentRecord.save(); console.log(`Payment record ${paymentRecord._id} (PI: ${pi.id}) updated to failed.`);}
                        else { console.log(`Stripe WH: Payment record ${paymentRecord._id} for PI ${pi.id} already failed.`);}
                        break;
                    case 'payment_intent.processing':
                         if (paymentRecord.paymentStatus !== 'processing') { paymentRecord.paymentStatus = 'processing'; paymentRecord.gatewayResponse = pi; await paymentRecord.save(); console.log(`Payment record ${paymentRecord._id} (PI: ${pi.id}) updated to processing.`);}
                        break;
                    case 'payment_intent.requires_action':
                        if (paymentRecord.paymentStatus !== 'requires_action') { paymentRecord.paymentStatus = 'requires_action'; paymentRecord.gatewayResponse = pi; await paymentRecord.save(); console.log(`Payment record ${paymentRecord._id} (PI: ${pi.id}) updated to requires_action.`);}
                        break;
                }
            }
        } else if (event.type === 'invoice.paid') {
            const invoice = eventDataObject;
            console.log(`Stripe WH: Invoice paid. ID: ${invoice.id}, Sub: ${invoice.subscription}, PI: ${invoice.payment_intent}`);
            if (invoice.subscription && invoice.payment_intent) {
                userSubscription = await UserSubscription.findOne({ stripeSubscriptionId: invoice.subscription, gateway: 'Stripe' });
                if (!userSubscription) {
                    const stripeSub = await stripe.subscriptions.retrieve(invoice.subscription, { expand: ['metadata'] });
                    if(stripeSub) userSubscription = await syncSubscriptionStatusFromStripe(stripeSub);
                }
                if (userSubscription) {
                    await syncSubscriptionStatusFromStripe(await stripe.subscriptions.retrieve(invoice.subscription));
                    let renewalPayment = await Payment.findOne({ transactionId: invoice.payment_intent, paymentGateway: 'Stripe' });
                    if (!renewalPayment) {
                        renewalPayment = new Payment({
                            user: userSubscription.user, subscription: userSubscription._id,
                            amount: invoice.amount_paid / 100, amountInSmallestUnit: invoice.amount_paid,
                            currency: invoice.currency.toUpperCase(), paymentGateway: 'Stripe',
                            transactionId: invoice.payment_intent, paymentStatus: 'succeeded',
                            gatewayResponse: invoice, metadata: { stripeInvoiceId: invoice.id, stripeSubscriptionId: invoice.subscription, reason: 'subscription_renewal'}
                        });
                        await renewalPayment.save(); console.log(`Payment record created for invoice.paid: ${renewalPayment._id}`);
                    } else if(renewalPayment.paymentStatus !== 'succeeded'){
                        renewalPayment.paymentStatus = 'succeeded'; renewalPayment.gatewayResponse = invoice;
                        await renewalPayment.save(); console.log(`Payment record ${renewalPayment._id} updated to succeeded from invoice.paid.`);
                    }
                } else { console.error(`Stripe WH: UserSub not found for sub ID ${invoice.subscription} from invoice.paid.`); }
            }
        } else if (event.type === 'invoice.payment_failed') {
            const invoice = eventDataObject;
            console.log(`Stripe WH: Invoice payment_failed. ID: ${invoice.id}, Sub: ${invoice.subscription}`);
            if (invoice.subscription) {
                const stripeSub = await stripe.subscriptions.retrieve(invoice.subscription);
                if(stripeSub) await syncSubscriptionStatusFromStripe(stripeSub);
            }
         }
        else { console.log(`Stripe WH: Unhandled type ${event.type}.`); }
    } catch (error) { console.error(`Stripe WH Error (event ${event.id}):`, error); return res.status(500).json({ error: 'WH processing error.' });}
    res.status(200).json({ received: true });
};

const syncPaypalSubscriptionStatus = async (paypalSubscriptionObject, eventTypeForLog = 'SYNC') => {
    const paypalSubId = paypalSubscriptionObject.id;
    let userSubscription = await UserSubscription.findOne({ paypalSubscriptionId: paypalSubId, gateway: 'PayPal' });
    if (!userSubscription) {
        const userIdFromCustomId = paypalSubscriptionObject.custom_id;
        const planIdFromPayPal = paypalSubscriptionObject.plan_id;
        const ourPlan = await SubscriptionPlan.findOne({ paypalPlanId: planIdFromPayPal });
        let userIdToUse = null;
        if (userIdFromCustomId && ourPlan) userIdToUse = userIdFromCustomId;
        else if (paypalSubscriptionObject.subscriber?.email_address && ourPlan) {
            const userByEmail = await User.findOne({ email: paypalSubscriptionObject.subscriber.email_address });
            if (userByEmail) userIdToUse = userByEmail._id;
        }
        if (userIdToUse && ourPlan) {
            console.log(`SyncPayPal: UserSub for ${paypalSubId} not found. Creating.`);
            userSubscription = new UserSubscription({
                user: userIdToUse, plan: ourPlan._id, gateway: 'PayPal', paypalSubscriptionId: paypalSubId,
                gatewayCustomerId: paypalSubscriptionObject.subscriber?.payer_id, gatewayPriceOrPlanId: planIdFromPayPal,
                status: 'pending_approval',
                metadata: { paypalWebhookAutoCreated: true, rawStatusFromPayPal: paypalSubscriptionObject.status }
            });
        } else { console.warn(`SyncPayPal: UserSub for ${paypalSubId} not found & cannot create.`); return null; }
    }

    let newStatus = userSubscription.status;
    switch (paypalSubscriptionObject.status) {
        case 'APPROVAL_PENDING': newStatus = 'pending_approval'; break;
        case 'APPROVED': newStatus = 'pending_approval'; break;
        case 'ACTIVE':
            const bi = paypalSubscriptionObject.billing_info; let isTrial = false;
            if (bi?.cycle_executions?.[0]?.tenure_type === 'TRIAL' && (bi.cycle_executions[0].cycles_remaining > 0 || (bi.cycle_executions[0].cycles_completed === 0 && bi.cycle_executions[0].total_cycles > 0))) isTrial = true;
            newStatus = isTrial ? 'trialing' : 'active'; break;
        case 'SUSPENDED': newStatus = 'suspended'; break;
        case 'CANCELLED': newStatus = 'canceled'; break;
        case 'EXPIRED': newStatus = 'expired'; break;
        default: console.warn(`SyncPayPal: Unknown status ${paypalSubscriptionObject.status}.`);
    }
    userSubscription.status = newStatus;

    if (paypalSubscriptionObject.billing_info) {
        const bi = paypalSubscriptionObject.billing_info;
        if (bi.next_billing_time) userSubscription.currentPeriodEnd = new Date(bi.next_billing_time);
        if (paypalSubscriptionObject.start_time) {
            const subStartTime = new Date(paypalSubscriptionObject.start_time);
            if (!userSubscription.currentPeriodStart || newStatus === 'active' || newStatus === 'trialing') {
                if (bi.last_payment?.time && new Date(bi.last_payment.time) >= subStartTime) userSubscription.currentPeriodStart = new Date(bi.last_payment.time);
                else userSubscription.currentPeriodStart = subStartTime;
            }
        }
        if (newStatus === 'trialing' && paypalSubscriptionObject.start_time) {
            userSubscription.trialStart = new Date(paypalSubscriptionObject.start_time);
            if (bi.next_billing_time) userSubscription.trialEnd = new Date(bi.next_billing_time);
        }
    }

    if (paypalSubscriptionObject.status === 'CANCELLED' && !userSubscription.canceledAt) userSubscription.canceledAt = new Date(paypalSubscriptionObject.update_time || Date.now());
    if (paypalSubscriptionObject.status === 'EXPIRED' && !userSubscription.endedAt) userSubscription.endedAt = new Date(paypalSubscriptionObject.update_time || Date.now());
    if (!userSubscription.metadata) userSubscription.metadata = {};
    userSubscription.metadata.lastPaypalStatus = paypalSubscriptionObject.status;
    userSubscription.metadata.lastPaypalWebhookSync = new Date();
    userSubscription.metadata.webhookEventType = eventTypeForLog;

    try { await userSubscription.save(); console.log(`UserSub ${userSubscription._id} (PayPal ID: ${paypalSubId}) synced by ${eventTypeForLog}. Status: ${userSubscription.status}`); }
    catch (saveError) { console.error(`SyncPayPal: Error saving UserSub ${userSubscription._id}:`, saveError); return null; }
    return userSubscription;
};

// @desc    Handle PayPal Webhook events
// @route   POST /api/v1/payments/paypal/webhook
// @access  Public
exports.handlePaypalWebhook = async (req, res) => {
    if (!paypalClient) {
        console.error('PayPal webhook received but client not configured.');
        return res.status(500).json({ error: 'PayPal client not configured.' });
    }

    // TODO: Implement PayPal Webhook Verification. This is CRITICAL for production.
    // const headers = req.headers;
    // const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    // try {
    //     const verifyRequest = new paypalSDK.notifications.WebhooksVerifySignatureRequest();
    //     verifyRequest.requestBody({ /* ... populate with headers and body ... */ });
    //     const verificationResponse = await paypalClient.execute(verifyRequest);
    //     if (verificationResponse.result.verification_status !== 'SUCCESS') { /* handle failure */ }
    //     console.log("PayPal Webhook: Signature verified successfully.");
    // } catch (verificationError) { /* handle error */ }

    const event = req.body;
    console.log(`PayPal Webhook Event Received: Type: ${event.event_type}, ID: ${event.id}, Summary: ${event.summary || 'N/A'}`);

    try {
        const eventType = event.event_type;
        const resource = event.resource;

        if (!eventType || !resource) {
            console.warn('PayPal Webhook: Invalid event structure.');
            return res.status(400).send('Invalid event structure.');
        }

        let paymentRecord;
        let userSubscription;
        let orderId;
        let paypalSubscriptionId;

        if (eventType.startsWith('BILLING.SUBSCRIPTION.')) {
            paypalSubscriptionId = resource.id;
            if (paypalSubscriptionId) {
                console.log(`PayPal Subscription Event: ${eventType} for SubID: ${paypalSubscriptionId}`);
                userSubscription = await syncPaypalSubscriptionStatus(resource, eventType);
                if (!userSubscription) {
                    console.warn(`PayPal Webhook: Could not sync/find UserSubscription for PayPal Sub ID ${paypalSubscriptionId}. Event: ${eventType}`);
                } else {
                    if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
                        console.log(`UserSubscription ${userSubscription._id} (PayPal: ${paypalSubscriptionId}) ACTIVATED.`);
                    } else if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
                        console.log(`UserSubscription ${userSubscription._id} (PayPal: ${paypalSubscriptionId}) CANCELLED.`);
                    }
                }
            } else {
                 console.warn(`PayPal Webhook: Subscription event ${eventType} but resource.id (paypalSubscriptionId) is missing.`);
            }
        }
        else if (eventType === 'PAYMENT.SALE.COMPLETED') {
            const sale = resource;
            paypalSubscriptionId = sale.billing_agreement_id;

            if (paypalSubscriptionId) {
                console.log(`PayPal Subscription Payment (Sale Completed): SubID ${paypalSubscriptionId}, SaleID ${sale.id}, Amount: ${sale.amount.total} ${sale.amount.currency_code}`);
                userSubscription = await UserSubscription.findOne({ paypalSubscriptionId: paypalSubscriptionId, gateway: 'PayPal' });
                if (userSubscription) {
                    let recurringPayment = await Payment.findOne({ transactionId: sale.id, paymentGateway: 'PayPal' });
                    if (!recurringPayment) {
                        recurringPayment = new Payment({
                            user: userSubscription.user,
                            subscription: userSubscription._id,
                            amount: parseFloat(sale.amount.total),
                            amountInSmallestUnit: Math.round(parseFloat(sale.amount.total) * 100),
                            currency: sale.amount.currency_code,
                            paymentGateway: 'PayPal',
                            transactionId: sale.id,
                            paymentStatus: 'succeeded',
                            gatewayResponse: sale,
                            metadata: {
                                paypalSubscriptionId: paypalSubscriptionId,
                                reason: 'subscription_recurring_payment',
                                paypalParentPayment: sale.parent_payment
                            }
                        });
                        await recurringPayment.save();
                        console.log(`Recurring Payment record ${recurringPayment._id} created for PayPal subscription ${paypalSubscriptionId}.`);
                    } else {
                        if (recurringPayment.paymentStatus !== 'succeeded') {
                            recurringPayment.paymentStatus = 'succeeded';
                            recurringPayment.gatewayResponse = sale;
                            await recurringPayment.save();
                            console.log(`Recurring Payment record ${recurringPayment._id} for sale ${sale.id} status updated to succeeded.`);
                        } else {
                             console.log(`Recurring Payment record ${recurringPayment._id} already exists and succeeded for sale ${sale.id}.`);
                        }
                    }

                    if (userSubscription.status !== 'active' && userSubscription.status !== 'trialing') {
                        console.log(`Subscription ${userSubscription.paypalSubscriptionId} was ${userSubscription.status}, attempting to sync to active post-payment.`);
                        try {
                            const getSubRequest = new paypalSDK.subscriptions.SubscriptionsGetRequest(paypalSubscriptionId);
                            const livePaypalSub = await paypalClient.execute(getSubRequest);
                            await syncPaypalSubscriptionStatus(livePaypalSub.result, eventType);
                        } catch (getSubError) {
                            console.error(`Error fetching live PayPal subscription ${paypalSubscriptionId} after payment:`, getSubError.message);
                        }
                    }
                } else {
                    console.warn(`PayPal Webhook: UserSubscription not found for PayPal Sub ID ${paypalSubscriptionId} from PAYMENT.SALE.COMPLETED event for sale ${sale.id}.`);
                }
            } else {
                orderId = sale.parent_payment;
                console.log(`PayPal One-Time Payment (Sale Completed): OrderID (ParentPayment) ${orderId}, SaleID ${sale.id}`);
                if (orderId) {
                    paymentRecord = await Payment.findOne({ transactionId: orderId, paymentGateway: 'PayPal' });
                     if (paymentRecord && paymentRecord.paymentStatus !== 'succeeded') {
                        paymentRecord.paymentStatus = 'succeeded';
                        paymentRecord.gatewayResponse = { ...paymentRecord.gatewayResponse, sale_completed_event: sale };
                        if(!paymentRecord.metadata) paymentRecord.metadata = {};
                        paymentRecord.metadata.paypalSaleId = sale.id;
                        await paymentRecord.save();
                        console.log(`One-time Payment record ${paymentRecord._id} (Order ${orderId}) updated to SUCCEEDED by PAYMENT.SALE.COMPLETED.`);
                        if (paymentRecord.enrollment) {
                            const enrollment = await Enrollment.findById(paymentRecord.enrollment);
                            if (enrollment && enrollment.status !== 'active') { enrollment.status = 'active'; await enrollment.save(); console.log(`Enrollment ${enrollment._id} activated.`);}
                        }
                    } else if (paymentRecord) {
                        console.log(`One-time Payment record ${paymentRecord._id} (Order ${orderId}) already succeeded.`);
                    } else {
                        console.warn(`PayPal Webhook: One-time Payment record not found for OrderID ${orderId} from sale ${sale.id}.`);
                    }
                } else {
                    console.warn(`PayPal Webhook: PAYMENT.SALE.COMPLETED event for sale ${sale.id} without a billing_agreement_id (subscription) or parent_payment (one-time order).`);
                }
            }
        }
        else if (eventType === 'CHECKOUT.ORDER.APPROVED') {
            orderId = resource.id;
            console.log(`PayPal Webhook: CHECKOUT.ORDER.APPROVED for Order ID: ${orderId}`);
            paymentRecord = await Payment.findOne({ transactionId: orderId, paymentGateway: 'PayPal' });
            if (!paymentRecord) {
                console.error(`PayPal Webhook: Payment record not found for Order ID: ${orderId} (event: ${eventType})`);
            } else if (paymentRecord.paymentStatus !== 'succeeded' && paymentRecord.paymentStatus !== 'APPROVED') {
                paymentRecord.paymentStatus = 'APPROVED';
                paymentRecord.gatewayResponse = resource;
                if (!paymentRecord.metadata) paymentRecord.metadata = {};
                paymentRecord.metadata.webhookEvents = [...(paymentRecord.metadata.webhookEvents || []), {type: eventType, receivedAt: new Date()}];
                await paymentRecord.save();
                console.log(`Payment record ${paymentRecord._id} (Order ${orderId}) status updated to APPROVED by webhook.`);
            } else {
                console.log(`Payment record ${paymentRecord._id} (Order ${orderId}) already processed for ${eventType}.`);
            }
        }
        else if (eventType === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED') {
            paypalSubscriptionId = resource.subscription_id;
            if(!paypalSubscriptionId && resource.id && resource.plan_id) paypalSubscriptionId = resource.id;
            else if (!paypalSubscriptionId && resource.links) {
                const subLink = resource.links.find(l => l.href.includes('/billing/subscriptions/'));
                if(subLink) paypalSubscriptionId = subLink.href.split('/').pop();
            }

            console.log(`PayPal Webhook: BILLING.SUBSCRIPTION.PAYMENT.FAILED for PayPal Subscription ID: ${paypalSubscriptionId || 'Not found in resource'}`);
            if(paypalSubscriptionId){
                try {
                    const getSubRequest = new paypalSDK.subscriptions.SubscriptionsGetRequest(paypalSubscriptionId);
                    const livePaypalSub = await paypalClient.execute(getSubRequest);
                    await syncPaypalSubscriptionStatus(livePaypalSub.result, eventType);
                } catch (getSubError) {
                     console.error(`Error fetching live PayPal subscription ${paypalSubscriptionId} after payment failure event:`, getSubError.message);
                }
            } else {
                 console.warn(`PayPal Webhook: BILLING.SUBSCRIPTION.PAYMENT.FAILED event without a clear subscription_id in resource.`);
            }
        }
        else {
            console.log(`PayPal Webhook: Unhandled or already covered event type ${eventType}. Summary: ${event.summary || 'N/A'}`);
        }
        res.status(200).json({ received: true, message: "Webhook processed." });

    } catch (error) {
        console.error(`PayPal Webhook - Error processing event ${event ? event.id : 'unknown'} (type: ${event ? event.event_type : 'unknown'}):`, error.message, error.stack);
        res.status(500).json({ error: 'Failed to process webhook event.' });
    }
};
