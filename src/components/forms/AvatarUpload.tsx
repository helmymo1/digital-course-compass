
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  isLoading: boolean;
}

const AvatarUpload = ({ currentAvatar, userName, onUpload, onRemove, isLoading }: AvatarUploadProps) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t('Please select an image file', 'يرجى اختيار ملف صورة'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('File size must be less than 5MB', 'يجب أن يكون حجم الملف أقل من 5 ميجابايت'));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    onUpload(file);
  };

  const handleRemoveAvatar = () => {
    setPreview(null);
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayAvatar = preview || currentAvatar;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Profile Picture', 'صورة الملف الشخصي')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Avatar className="h-20 w-20">
            <AvatarImage src={displayAvatar} alt={userName} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {t('Upload', 'رفع')}
              </Button>
              
              {displayAvatar && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('Remove', 'إزالة')}
                </Button>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">
              {t('Upload a photo up to 5MB', 'ارفع صورة بحد أقصى 5 ميجابايت')}
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export default AvatarUpload;
