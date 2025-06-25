
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useForm } from 'react-hook-form';

interface PasswordResetFormData {
  email: string;
}

interface PasswordResetFormProps {
  onSubmit: (email: string) => void;
  isLoading: boolean;
}

const PasswordResetForm = ({ onSubmit, isLoading }: PasswordResetFormProps) => {
  const { t } = useLanguage();
  const { register, handleSubmit, formState: { errors } } = useForm<PasswordResetFormData>();

  const handleFormSubmit = (data: PasswordResetFormData) => {
    onSubmit(data.email);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('Reset Password')}</CardTitle>
        <p className="text-muted-foreground">
          {t('Enter your email to receive reset instructions')}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('Email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('Enter your email')}
              {...register('email', {
                required: t('Email is required'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('Invalid email address')
                }
              })}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            <Mail className="h-4 w-4 mr-2" />
            {isLoading ? t('Sending...') : t('Send Reset Link')}
          </Button>
        </form>

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('Back to Login')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordResetForm;
