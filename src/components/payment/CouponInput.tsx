
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Tag } from 'lucide-react';

interface CouponInputProps {
  onCouponApply: (coupon: string, discount: number) => void;
  onCouponRemove: () => void;
  appliedCoupon?: { code: string; discount: number };
}

const CouponInput: React.FC<CouponInputProps> = ({
  onCouponApply,
  onCouponRemove,
  appliedCoupon
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  // Mock coupon validation
  const validateCoupon = async (code: string): Promise<{ valid: boolean; discount?: number; error?: string }> => {
    const validCoupons = {
      'SAVE20': { discount: 20 },
      'STUDENT50': { discount: 50 },
      'NEWUSER15': { discount: 15 }
    };

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    if (validCoupons[code as keyof typeof validCoupons]) {
      return { valid: true, discount: validCoupons[code as keyof typeof validCoupons].discount };
    }

    return { valid: false, error: 'Invalid coupon code' };
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsValidating(true);
    setError('');

    try {
      const result = await validateCoupon(couponCode.toUpperCase());
      
      if (result.valid && result.discount) {
        onCouponApply(couponCode.toUpperCase(), result.discount);
        setCouponCode('');
      } else {
        setError(result.error || 'Invalid coupon code');
      }
    } catch (err) {
      setError('Failed to validate coupon');
    }

    setIsValidating(false);
  };

  const handleRemoveCoupon = () => {
    onCouponRemove();
    setError('');
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Promo Code</span>
          </div>

          {appliedCoupon ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">
                  {appliedCoupon.code}
                </span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {appliedCoupon.discount}% OFF
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveCoupon}
                className="text-green-600 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter promo code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  className="flex-1"
                />
                <Button
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || isValidating}
                  variant="outline"
                >
                  {isValidating ? 'Validating...' : 'Apply'}
                </Button>
              </div>
              
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              
              <div className="text-xs text-muted-foreground">
                Try: SAVE20, STUDENT50, or NEWUSER15
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CouponInput;
