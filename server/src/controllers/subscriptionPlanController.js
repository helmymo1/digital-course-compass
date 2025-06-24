const SubscriptionPlan = require('../models/SubscriptionPlan');
// const Stripe = require('stripe'); // Uncomment if interacting with Stripe API directly here
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const paypalSDK = require('@paypal/paypal-server-sdk'); // Uncomment if interacting
// let paypalClient; // init paypalClient if used

// @desc    Create a new subscription plan in DB (assumes plan already exists on Stripe/PayPal)
// @route   POST /api/v1/admin/subscription-plans
// @access  Private/Admin
exports.createSubscriptionPlan = async (req, res) => {
    try {
        const {
            name, description, price, currency, interval, intervalCount,
            stripePriceId, paypalPlanId, features, isActive, trialPeriodDays, metadata
        } = req.body;

        if (!name || !price || !currency || !interval) {
            return res.status(400).json({ success: false, message: 'Name, price, currency, and interval are required.' });
        }
        if (!stripePriceId && !paypalPlanId) {
            return res.status(400).json({ success: false, message: 'At least one gateway plan ID (Stripe Price ID or PayPal Plan ID) must be provided.' });
        }

        // Check for uniqueness if IDs are provided
        if (stripePriceId) {
            const existingStripe = await SubscriptionPlan.findOne({ stripePriceId });
            if (existingStripe) return res.status(400).json({ success: false, message: `Plan with Stripe Price ID ${stripePriceId} already exists.` });
        }
        if (paypalPlanId) {
            const existingPaypal = await SubscriptionPlan.findOne({ paypalPlanId });
            if (existingPaypal) return res.status(400).json({ success: false, message: `Plan with PayPal Plan ID ${paypalPlanId} already exists.` });
        }

        const newPlan = new SubscriptionPlan({
            name, description, price, currency: currency.toUpperCase(), interval, intervalCount,
            stripePriceId, paypalPlanId, features, isActive, trialPeriodDays, metadata
        });
        const savedPlan = await newPlan.save();
        res.status(201).json({ success: true, data: savedPlan });
    } catch (error) {
        console.error('Create Subscription Plan Error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        // Duplicate key error for unique fields (already checked above, but as a fallback)
        if (error.code === 11000) {
             return res.status(400).json({ success: false, message: 'A plan with this Stripe Price ID or PayPal Plan ID might already exist.' });
        }
        res.status(500).json({ success: false, message: 'Server error creating subscription plan.' });
    }
};

// @desc    Get all subscription plans
// @route   GET /api/v1/subscription-plans  (public for active plans)
// @route   GET /api/v1/admin/subscription-plans (admin for all plans)
// @access  Public / Private/Admin
exports.listSubscriptionPlans = async (req, res) => {
    try {
        const isAdminPath = req.path.includes('/admin/');
        const filter = isAdminPath ? {} : { isActive: true };

        const plans = await SubscriptionPlan.find(filter).sort({ price: 1 });
        res.status(200).json({ success: true, count: plans.length, data: plans });
    } catch (error) {
        console.error('List Subscription Plans Error:', error);
        res.status(500).json({ success: false, message: 'Server error listing subscription plans.' });
    }
};

// @desc    Get a single subscription plan by ID
// @route   GET /api/v1/subscription-plans/:id (public for active)
// @route   GET /api/v1/admin/subscription-plans/:id (admin for any)
// @access  Public / Private/Admin
exports.getSubscriptionPlanById = async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);
        const isAdminPath = req.path.includes('/admin/');

        if (!plan || (!plan.isActive && !isAdminPath)) {
            return res.status(404).json({ success: false, message: 'Subscription plan not found or not active.' });
        }
        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        console.error('Get Subscription Plan Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching subscription plan.' });
    }
};

// @desc    Update a subscription plan
// @route   PUT /api/v1/admin/subscription-plans/:id
// @access  Private/Admin
exports.updateSubscriptionPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const existingPlan = await SubscriptionPlan.findById(id);
        if (!existingPlan) {
            return res.status(404).json({ success: false, message: 'Subscription plan not found.' });
        }

        // Prevent changing Stripe/PayPal IDs directly if they are set, can cause sync issues.
        // If gateway plan ID changes, it's effectively a new plan.
        if (updates.stripePriceId && existingPlan.stripePriceId && existingPlan.stripePriceId !== updates.stripePriceId) {
            return res.status(400).json({ success:false, message: "Cannot change stripePriceId of an existing plan. Create a new plan entry."});
        }
        if (updates.paypalPlanId && existingPlan.paypalPlanId && existingPlan.paypalPlanId !== updates.paypalPlanId) {
            return res.status(400).json({ success:false, message: "Cannot change paypalPlanId of an existing plan. Create a new plan entry."});
        }
        // Check for uniqueness if new gateway IDs are being set
        if (updates.stripePriceId && (!existingPlan.stripePriceId || existingPlan.stripePriceId !== updates.stripePriceId)) {
            const conflictingStripe = await SubscriptionPlan.findOne({ stripePriceId: updates.stripePriceId, _id: { $ne: id } });
            if (conflictingStripe) return res.status(400).json({ success: false, message: `Stripe Price ID ${updates.stripePriceId} is already in use.`});
        }
        if (updates.paypalPlanId && (!existingPlan.paypalPlanId || existingPlan.paypalPlanId !== updates.paypalPlanId)) {
            const conflictingPaypal = await SubscriptionPlan.findOne({ paypalPlanId: updates.paypalPlanId, _id: { $ne: id } });
            if (conflictingPaypal) return res.status(400).json({ success: false, message: `PayPal Plan ID ${updates.paypalPlanId} is already in use.`});
        }

        if (updates.currency) updates.currency = updates.currency.toUpperCase();

        const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(id, updates, {
            new: true, runValidators: true
        });

        res.status(200).json({ success: true, data: updatedPlan });
    } catch (error) {
        console.error('Update Subscription Plan Error:', error);
         if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: error.message });
         if (error.code === 11000) return res.status(400).json({ success: false, message: 'Update conflicts with an existing unique plan ID (Stripe or PayPal).' });
        res.status(500).json({ success: false, message: 'Server error updating subscription plan.' });
    }
};

// @desc    Deactivate/Delete a subscription plan
// @route   DELETE /api/v1/admin/subscription-plans/:id
// @access  Private/Admin
exports.deleteSubscriptionPlan = async (req, res) => {
    try {
        const { id } = req.params;
        // Prefer deactivation over hard delete if subscriptions might be linked.
        // For hard delete, ensure no UserSubscription records reference this plan.
        const activeSubscriptions = await UserSubscription.findOne({ plan: id, status: { $in: ['active', 'trialing', 'past_due', 'incomplete', 'suspended', 'pending_approval'] } });
        if (activeSubscriptions) {
            // If active subscriptions exist, only allow deactivation.
            const planToDeactivate = await SubscriptionPlan.findByIdAndUpdate(id, { isActive: false }, { new: true });
            if (!planToDeactivate) {
                return res.status(404).json({ success: false, message: 'Subscription plan not found.' });
            }
            return res.status(200).json({ success: true, message: 'Subscription plan has active users and was deactivated instead of deleted.', data: planToDeactivate });
        }

        // If no active subscriptions, allow hard delete.
        const deletedPlan = await SubscriptionPlan.findByIdAndDelete(id);
        if (!deletedPlan) {
            return res.status(404).json({ success: false, message: 'Subscription plan not found to delete.' });
        }
        res.status(200).json({ success: true, message: 'Subscription plan deleted successfully (no active users found linked).', data: deletedPlan });

    } catch (error) {
        console.error('Delete Subscription Plan Error:', error);
        res.status(500).json({ success: false, message: 'Server error deleting/deactivating subscription plan.' });
    }
};
