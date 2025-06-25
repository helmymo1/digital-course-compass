
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  interval: 'month' | 'year';
  features: string[];
  recommended?: boolean;
  popular?: boolean;
}

interface SubscriptionPlansProps {
  onSelectPlan: (planId: string) => void;
  currentPlan?: string;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSelectPlan, currentPlan }) => {
  const { t } = useLanguage();

  const plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      interval: 'month',
      features: [
        'Access to 50+ courses',
        'Basic progress tracking',
        'Community access',
        'Mobile app access'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      originalPrice: 29.99,
      interval: 'month',
      features: [
        'Access to 500+ courses',
        'Advanced progress tracking',
        'Priority community access',
        'Mobile app access',
        'Downloadable content',
        'Certificates of completion'
      ],
      recommended: true,
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 49.99,
      interval: 'month',
      features: [
        'Unlimited course access',
        'Advanced analytics',
        'Team management',
        'Custom learning paths',
        'Priority support',
        'API access',
        'White-label options'
      ]
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`relative ${
            plan.recommended ? 'border-primary shadow-lg scale-105' : ''
          } ${currentPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
        >
          {plan.popular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-3 py-1">
                <Star className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            </div>
          )}
          
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <div className="mt-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>
              {plan.originalPrice && (
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-lg text-muted-foreground line-through">
                    ${plan.originalPrice}
                  </span>
                  <Badge variant="secondary">
                    {Math.round((1 - plan.price / plan.originalPrice) * 100)}% OFF
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button
              className="w-full"
              variant={plan.recommended ? 'default' : 'outline'}
              onClick={() => onSelectPlan(plan.id)}
              disabled={currentPlan === plan.id}
            >
              {currentPlan === plan.id ? 'Current Plan' : `Choose ${plan.name}`}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SubscriptionPlans;
