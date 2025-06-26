const Coupon = require('../models/Coupon');
const mongoose = require('mongoose'); // For ObjectId validation if needed

/**
 * @desc    Validate a coupon
 * @route   POST /api/coupons/validate
 * @access  Public (or Private if user context is strictly needed for all validations)
 * Body: { couponCode, userId (optional), items: [{ itemId, itemType, price, quantity }] (optional) }
 */
exports.validateCoupon = async (req, res) => {
    const { couponCode, userId, items } = req.body;

    if (!couponCode) {
        return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    try {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), deletedAt: null });

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found.' });
        }

        // Check isActive
        if (!coupon.isActive) {
            return res.status(400).json({ success: false, message: 'This coupon is no longer active.' });
        }

        // Check validity dates
        const now = new Date();
        if (coupon.validFrom && coupon.validFrom > now) {
            return res.status(400).json({ success: false, message: 'This coupon is not yet valid.' });
        }
        if (coupon.validUntil && coupon.validUntil < now) {
            return res.status(400).json({ success: false, message: 'This coupon has expired.' });
        }

        // Check usage limits
        if (coupon.usageLimit !== null && coupon.timesUsed >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit.' });
        }

        // Check single use per user (if userId is provided)
        if (userId && coupon.isSingleUsePerUser) {
            if (coupon.usedBy && coupon.usedBy.some(id => id.equals(userId))) {
                return res.status(400).json({ success: false, message: 'You have already used this coupon.' });
            }
        }

        let cartTotal = 0;
        let applicableItemTotal = 0;
        let isApplicableToCart = true; // Assume true unless specific product restrictions exist

        if (items && items.length > 0) {
            cartTotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

            // Check minPurchaseAmount
            if (coupon.minPurchaseAmount > 0 && cartTotal < coupon.minPurchaseAmount) {
                return res.status(400).json({
                    success: false,
                    message: `A minimum purchase of ${coupon.minPurchaseAmount} ${coupon.currency || ''} is required to use this coupon.`
                });
            }

            // Check appliesToProducts
            if (coupon.appliesToProducts && coupon.appliesToProducts.length > 0) {
                // If appliesToProducts has 'All' type, it means it applies to all items of a certain category or any item.
                // For simplicity here, if appliesToProducts is not empty, we filter items.
                // A more complex logic would be needed for "any of these products" vs "all of these products".
                // This example assumes the coupon applies to the sum of prices of matching items.

                let hasMatchingProduct = false;
                applicableItemTotal = items.reduce((sum, cartItem) => {
                    const isMatch = coupon.appliesToProducts.some(couponProduct => {
                        // Basic check: itemType matches and if itemId is present, it matches.
                        // More specific checks might be needed (e.g. if couponProduct.itemId is null, it means any item of that type)
                        return cartItem.itemType === couponProduct.itemType &&
                               (!couponProduct.itemId || (cartItem.itemId && cartItem.itemId.toString() === couponProduct.itemId.toString()));
                    });
                    if (isMatch) {
                        hasMatchingProduct = true;
                        return sum + (cartItem.price * (cartItem.quantity || 1));
                    }
                    return sum;
                }, 0);

                if (!hasMatchingProduct) {
                     return res.status(400).json({ success: false, message: 'This coupon is not applicable to any items in your cart.' });
                }
                isApplicableToCart = hasMatchingProduct; // Coupon is applicable if at least one item matches
            } else {
                // No specific product restrictions, coupon applies to the whole cartTotal
                applicableItemTotal = cartTotal;
            }
        } else {
            // No items provided, can only do general validation.
            // minPurchaseAmount check might be misleading without items.
            // appliesToProducts check cannot be performed.
            // For now, we assume if no items, we only validate general properties.
            // If minPurchaseAmount > 0, it's technically not met without items.
            if (coupon.minPurchaseAmount > 0) {
                 return res.status(400).json({
                    success: false,
                    message: `This coupon requires a minimum purchase amount. Cart details not provided.`
                });
            }
        }

        if (!isApplicableToCart && items && items.length > 0) {
             return res.status(400).json({ success: false, message: 'This coupon is not applicable to the items in your cart.' });
        }


        // Calculate discount
        let discountAmount = 0;
        const amountToDiscount = (coupon.appliesToProducts && coupon.appliesToProducts.length > 0) ? applicableItemTotal : cartTotal;

        if (coupon.discountType === 'percentage') {
            discountAmount = (amountToDiscount * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                discountAmount = coupon.maxDiscountAmount;
            }
        } else if (coupon.discountType === 'fixed_amount') {
            discountAmount = coupon.discountValue;
            // Ensure fixed discount doesn't exceed the applicable total
            if (discountAmount > amountToDiscount) {
                discountAmount = amountToDiscount;
            }
        }

        // Ensure discount is not negative and has 2 decimal places
        discountAmount = Math.max(0, parseFloat(discountAmount.toFixed(2)));


        res.status(200).json({
            success: true,
            message: 'Coupon is valid.',
            coupon: {
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                maxDiscountAmount: coupon.maxDiscountAmount,
                // Potentially add currency if your system supports multi-currency coupons
            },
            calculatedDiscount: discountAmount,
            originalCartTotal: cartTotal > 0 ? parseFloat(cartTotal.toFixed(2)) : undefined,
            finalAmount: cartTotal > 0 ? parseFloat((cartTotal - discountAmount).toFixed(2)) : undefined,
            applicableAmountBeforeDiscount: parseFloat(amountToDiscount.toFixed(2))
        });

    } catch (error) {
        console.error('Error validating coupon:', error);
        res.status(500).json({ success: false, message: 'Failed to validate coupon.', error: error.message });
    }
};
