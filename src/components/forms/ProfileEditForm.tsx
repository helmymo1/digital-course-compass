
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  role: string;
  dateOfBirth: string;
  location: string;
  website: string;
  socialLinks: {
    linkedin: string;
    twitter: string;
    github: string;
  };
}

interface ProfileEditFormProps {
  initialData?: Partial<ProfileData>;
  onSubmit: (data: ProfileData) => void;
  isLoading: boolean;
}

const ProfileEditForm = ({ initialData, onSubmit, isLoading }: ProfileEditFormProps) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<ProfileData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    bio: initialData?.bio || '',
    role: initialData?.role || 'student',
    dateOfBirth: initialData?.dateOfBirth || '',
    location: initialData?.location || '',
    website: initialData?.website || '',
    socialLinks: {
      linkedin: initialData?.socialLinks?.linkedin || '',
      twitter: initialData?.socialLinks?.twitter || '',
      github: initialData?.socialLinks?.github || '',
    },
  });

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform: keyof ProfileData['socialLinks'], value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Edit Profile')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('First Name')}</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('Last Name')}</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('Email')}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('Phone Number')}</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">{t('Bio')}</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
              placeholder={t('Tell us about yourself...')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">{t('Role')}</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">{t('Student')}</SelectItem>
                  <SelectItem value="instructor">{t('Instructor')}</SelectItem>
                  <SelectItem value="admin">{t('Admin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">{t('Date of Birth')}</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">{t('Location')}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder={t('City, Country')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">{t('Website')}</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('Social Links')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  value={formData.socialLinks.github}
                  onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                  placeholder="https://github.com/username"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" disabled={isLoading}>
              {t('Cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('Saving...') : t('Save Changes')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileEditForm;
