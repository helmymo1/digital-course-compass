
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useForm } from 'react-hook-form';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  phone: string;
  website: string;
}

interface ProfileEditFormProps {
  initialData?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => void;
  isLoading: boolean;
}

const ProfileEditForm = ({ initialData, onSubmit, isLoading }: ProfileEditFormProps) => {
  const { t } = useLanguage();
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: initialData
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Edit Profile', 'تعديل الملف الشخصي')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('First Name', 'الاسم الأول')}</Label>
              <Input
                id="firstName"
                {...register('firstName', { 
                  required: t('First name is required', 'الاسم الأول مطلوب') 
                })}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('Last Name', 'الاسم الأخير')}</Label>
              <Input
                id="lastName"
                {...register('lastName', { 
                  required: t('Last name is required', 'الاسم الأخير مطلوب') 
                })}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('Email', 'البريد الإلكتروني')}</Label>
            <Input
              id="email"
              type="email"
              {...register('email', {
                required: t('Email is required', 'البريد الإلكتروني مطلوب'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('Invalid email address', 'عنوان بريد إلكتروني غير صحيح')
                }
              })}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('Phone', 'الهاتف')}</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">{t('Website', 'الموقع الإلكتروني')}</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://"
              {...register('website')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">{t('Bio', 'النبذة الشخصية')}</Label>
            <Textarea
              id="bio"
              placeholder={t('Tell us about yourself...', 'أخبرنا عن نفسك...')}
              {...register('bio')}
              rows={4}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? t('Saving...', 'جارٍ الحفظ...') : t('Save Changes', 'حفظ التغييرات')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileEditForm;
