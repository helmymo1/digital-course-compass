const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Coupon code is required.'],
        unique: true,
        trim: true,
        uppercase: true,
        minlength: [3, 'Coupon code must be at least 3 characters long.'],
        maxlength: [50, 'Coupon code cannot exceed 50 characters.'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [255, 'Description cannot exceed 255 characters.'],
    },
    discountType: {
        type: String,
        required: [true, 'Discount type is required.'],
        enum: {
            values: ['percentage', 'fixed_amount'],
            message: 'Discount type must be either "percentage" or "fixed_amount".'
        }
    },
    discountValue: {
        type: Number,
        required: [true, 'Discount value is required.'],
        min: [0.01, 'Discount value must be greater than 0.'],
        validate: {
            validator: function(value) {
                if (this.discountType === 'percentage') {
                    return value > 0 && value <= 100;
                }
                return true;
            },
            message: props => props.path === 'discountValue' && this.discountType === 'percentage' ? 'Percentage discount must be between 0.01 and 100.' : 'Invalid discount value.'
        }
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    validFrom: {
        type: Date,
        default: Date.now,
    },
    validUntil: {
        type: Date,
        default: null, // null means no expiry date
        index: true,
    },
    usageLimit: { // Total number of times this coupon can be used across all users
        type: Number,
        default: null, // null for unlimited uses
        min: [1, 'Usage limit must be at least 1.'],
    },
    timesUsed: { // How many times this coupon has been used
        type: Number,
        default: 0,
        min: [0, 'Times used cannot be negative.'],
    },
    minPurchaseAmount: { // Minimum cart total for the coupon to be applicable
        type: Number,
        default: 0,
        min: [0, 'Minimum purchase amount cannot be negative.'],
    },
    maxDiscountAmount: { // For percentage discounts, an optional cap on the discount amount
        type: Number,
        min: [0.01, 'Maximum discount amount must be greater than 0.'],
        default: null,
    },
    // Specifies which products (courses, subscription plans) the coupon applies to.
    // Empty array means it applies to all eligible items in the cart.
    appliesToProducts: [{
        itemType: {
            type: String,
            required: true,
            enum: ['Course', 'SubscriptionPlan', 'ProductCategory', 'All'], // 'All' can be a special type if not empty
        },
        itemId: { // ObjectId of the Course or SubscriptionPlan, or a category identifier
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'appliesToProducts.itemType', // Dynamic ref based on itemType (ensure models are named 'Course', 'SubscriptionPlan')
            // Not strictly required if itemType is 'All' or a general category not tied to a specific DB ID
        },
        _id: false
    }],
    isSingleUsePerUser: { // Can a single user use this coupon multiple times?
        type: Boolean,
        default: false, // If true, check 'usedBy' array
    },
    usedBy: [{ // Array of User ObjectIds that have used this coupon (if isSingleUsePerUser is true)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    // Soft delete
    deletedAt: {
        type: Date,
        default: null,
        index: true,
    },
}, { timestamps: true });

// Indexes
couponSchema.index({ code: 1, deletedAt: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
couponSchema.index({ isActive: 1, validUntil: 1, deletedAt: 1 }); // For querying active, non-expired coupons

// Pre-save hook to ensure uppercase code
couponSchema.pre('save', function(next) {
    if (this.isModified('code')) {
        this.code = this.code.toUpperCase();
    }
    next();
});

// Virtual to check if coupon is currently valid (active, within date range, not over usage limit)
couponSchema.virtual('isValid').get(function() {
    const now = new Date();
    if (!this.isActive || this.deletedAt) return false;
    if (this.validFrom && this.validFrom > now) return false;
    if (this.validUntil && this.validUntil < now) return false;
    if (this.usageLimit !== null && this.timesUsed >= this.usageLimit) return false;
    return true;
});

// Method to increment usage count
couponSchema.methods.incrementUsage = async function(userId = null) {
    this.timesUsed += 1;
    if (userId && this.isSingleUsePerUser && !this.usedBy.includes(userId)) {
        this.usedBy.push(userId);
    }
    return this.save();
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
