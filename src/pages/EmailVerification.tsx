
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Mail, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const EmailVerification = () => {
  const { t } = useLanguage();
  const { token } = useParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (token.length > 10) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('error');
      }
    };

    verifyEmail();
  }, [token]);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t('Email Verification')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              {status === 'loading' && (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">
                    {t('Verifying your email...')}
                  </p>
                </div>
              )}

              {status === 'success' && (
                <div className="space-y-4">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-700">
                      {t('Email Verified Successfully!')}
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      {t('Your account has been verified. You can now log in.')}
                    </p>
                  </div>
                  <Link to="/login">
                    <Button className="w-full">
                      {t('Go to Login')}
                    </Button>
                  </Link>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-4">
                  <XCircle className="h-12 w-12 mx-auto text-red-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-700">
                      {t('Verification Failed')}
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      {t('The verification link is invalid or has expired.')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Button onClick={handleResendVerification} disabled={isResending} className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      {isResending ? t('Sending...') : t('Resend Verification')}
                    </Button>
                    <Link to="/login">
                      <Button variant="outline" className="w-full">
                        {t('Back to Login')}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
