const Payment = require('../models/Payment');
const UserSubscription = require('../models/UserSubscription');
const SubscriptionPlan = require('../models/SubscriptionPlan'); // For revenue by plan
const mongoose = require('mongoose');

// @desc    Get basic revenue analytics
// @route   GET /api/v1/admin/analytics/revenue-summary
// @access  Private/Admin
exports.getRevenueSummary = async (req, res) => {
    try {
        const { startDate: queryStartDate, endDate: queryEndDate } = req.query;

        let defaultDays = 30;
        if (queryStartDate && queryEndDate) defaultDays = null; // If date range, don't use defaultDays

        let startDate, endDate;

        if (queryStartDate && queryEndDate) {
            startDate = new Date(queryStartDate);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(queryEndDate);
            endDate.setHours(23, 59, 59, 999);
        } else {
            const daysQuery = parseInt(req.query.days, 10);
            const periodDays = (daysQuery && daysQuery > 0 && daysQuery <= 730) ? daysQuery : defaultDays; // Max 2 years for default query

            endDate = new Date(); // Now for period end
            startDate = new Date();
            startDate.setDate(startDate.getDate() - periodDays);
            startDate.setHours(0, 0, 0, 0);
        }

        const periodInDaysForLabel = defaultDays ? defaultDays : Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));


        // --- Total Revenue Overall ---
        const totalRevenueResult = await Payment.aggregate([
            { $match: { paymentStatus: 'succeeded' } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;
        const totalSuccessfulPayments = totalRevenueResult.length > 0 ? totalRevenueResult[0].count : 0;

        // --- Revenue in specified period ---
        const revenueInPeriodResult = await Payment.aggregate([
            { $match: { paymentStatus: 'succeeded', createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);
        const revenueInPeriod = revenueInPeriodResult.length > 0 ? revenueInPeriodResult[0].total : 0;
        const successfulPaymentsInPeriod = revenueInPeriodResult.length > 0 ? revenueInPeriodResult[0].count : 0;

        // --- Revenue by Gateway (in period) ---
        const revenueByGatewayInPeriod = await Payment.aggregate([
            { $match: { paymentStatus: 'succeeded', createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: '$paymentGateway', total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        // --- Revenue by Subscription Plan (in period, from successful subscription payments) ---
        const revenueByPlanInPeriod = await Payment.aggregate([
            { $match: {
                paymentStatus: 'succeeded',
                subscription: { $ne: null }, // Only payments linked to a subscription
                createdAt: { $gte: startDate, $lte: endDate }
            }},
            { $lookup: {
                from: UserSubscription.collection.name, // Ensure this is the correct collection name
                localField: 'subscription',
                foreignField: '_id',
                as: 'userSubscriptionInfo'
            }},
            { $unwind: '$userSubscriptionInfo' },
            { $lookup: {
                from: SubscriptionPlan.collection.name,
                localField: 'userSubscriptionInfo.plan',
                foreignField: '_id',
                as: 'planInfo'
            }},
            { $unwind: '$planInfo' },
            { $group: {
                _id: '$planInfo.name', // Group by plan name
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }},
            { $sort: { total: -1 } }
        ]);

        // --- New Subscriptions in period (count) ---
        const newSubscriptionsInPeriod = await UserSubscription.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate },
            // This counts any subscription record created, status might vary (trialing, active, incomplete)
        });

        // --- Active Subscriptions (current count) ---
        const activeSubscriptionsCount = await UserSubscription.countDocuments({
            status: { $in: ['active', 'trialing'] } // Define what "active" means for your app
        });


        res.status(200).json({
            success: true,
            summary: {
                overallTotalRevenue: parseFloat(totalRevenue.toFixed(2)),
                totalSuccessfulPayments: totalSuccessfulPayments,
                period: {
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    daysForLabel: periodInDaysForLabel,
                    revenueInPeriod: parseFloat(revenueInPeriod.toFixed(2)),
                    successfulPaymentsInPeriod: successfulPaymentsInPeriod,
                    revenueByGatewayInPeriod: revenueByGatewayInPeriod.map(r => ({ gateway: r._id, total: parseFloat(r.total.toFixed(2)), count: r.count })),
                    revenueBySubscriptionPlanInPeriod: revenueByPlanInPeriod.map(r => ({ planName: r._id, total: parseFloat(r.total.toFixed(2)), count: r.count })),
                    newSubscriptionsInPeriod: newSubscriptionsInPeriod,
                },
                currentActiveSubscriptions: activeSubscriptionsCount,
            }
        });

    } catch (error) {
        console.error('Get Revenue Summary Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching revenue summary.', error: error.message });
    }
};
