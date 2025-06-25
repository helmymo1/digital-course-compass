
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CreditCard, Smartphone } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface PaymentMethodSelectorProps {
  onMethodSelect: (method: string) => void;
  selectedMethod?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onMethodSelect,
  selectedMethod = 'card'
}) => {
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="h-5 w-5" />,
      enabled: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">P</div>,
      enabled: true
    },
    {
      id: 'apple-pay',
      name: 'Apple Pay',
      icon: <Smartphone className="h-5 w-5" />,
      enabled: false
    },
    {
      id: 'google-pay',
      name: 'Google Pay',
      icon: <Smartphone className="h-5 w-5" />,
      enabled: false
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={selectedMethod}
          onValueChange={onMethodSelect}
          className="space-y-3"
        >
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`flex items-center space-x-3 p-3 border rounded-lg ${
                !method.enabled ? 'opacity-50' : ''
              }`}
            >
              <RadioGroupItem
                value={method.id}
                id={method.id}
                disabled={!method.enabled}
              />
              <div className="flex items-center space-x-2">
                {method.icon}
                <Label htmlFor={method.id} className={!method.enabled ? 'opacity-50' : ''}>
                  {method.name}
                  {!method.enabled && ' (Coming Soon)'}
                </Label>
              </div>
            </div>
          ))}
        </RadioGroup>

        {selectedMethod === 'card' && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={cardDetails.name}
                onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
        )}

        {selectedMethod === 'paypal' && (
          <div className="p-4 border rounded-lg bg-blue-50">
            <p className="text-sm text-blue-800">
              You'll be redirected to PayPal to complete your payment securely.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;
