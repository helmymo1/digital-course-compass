
import React from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const PaymentSuccess = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="pt-12 pb-8">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-2">{t('payment_successful_title')}</h1>
                <p className="text-muted-foreground">
                  {t('payment_successful_desc')}
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h2 className="font-semibold mb-2">{t('course_enrolled_label')}</h2>
                <p className="text-lg">Complete Web Development Bootcamp</p>
                <p className="text-sm text-muted-foreground">{t('by_instructor')}</p>
              </div>

              <div className="space-y-4">
                <Link to="/dashboard">
                  <Button size="lg" className="w-full group">
                    {t('go_to_dashboard_button')}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                <Link to="/courses">
                  <Button variant="outline" size="lg" className="w-full">
                    {t('browse_more_courses_button')}
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-muted-foreground mt-6">
                {t('confirmation_email_sent')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
