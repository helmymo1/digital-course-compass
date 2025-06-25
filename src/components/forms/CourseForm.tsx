
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useForm, Controller } from 'react-hook-form';

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  estimatedDuration: number;
  thumbnail: string;
  status: 'draft' | 'published';
}

interface CourseFormProps {
  initialData?: Partial<CourseFormData>;
  onSubmit: (data: CourseFormData) => void;
  isLoading: boolean;
  isEdit?: boolean;
}

const categories = [
  'Programming',
  'Design',
  'Business',
  'Marketing',
  'Photography',
  'Music',
  'Language',
  'Health & Fitness'
];

const levels = [
  'Beginner',
  'Intermediate', 
  'Advanced',
  'All Levels'
];

const CourseForm = ({ initialData, onSubmit, isLoading, isEdit = false }: CourseFormProps) => {
  const { t } = useLanguage();
  const { register, handleSubmit, control, formState: { errors } } = useForm<CourseFormData>({
    defaultValues: initialData
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? t('Edit Course', 'تعديل الدورة') : t('Create New Course', 'إنشاء دورة جديدة')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">{t('Course Title', 'عنوان الدورة')}</Label>
            <Input
              id="title"
              placeholder={t('Enter course title', 'أدخل عنوان الدورة')}
              {...register('title', { 
                required: t('Course title is required', 'عنوان الدورة مطلوب'),
                minLength: {
                  value: 5,
                  message: t('Title must be at least 5 characters', 'العنوان يجب أن يكون 5 أحرف على الأقل')
                }
              })}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('Description', 'الوصف')}</Label>
            <Textarea
              id="description"
              placeholder={t('Describe your course...', 'اوصف دورتك...')}
              rows={4}
              {...register('description', { 
                required: t('Description is required', 'الوصف مطلوب'),
                minLength: {
                  value: 20,
                  message: t('Description must be at least 20 characters', 'الوصف يجب أن يكون 20 حرف على الأقل')
                }
              })}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('Category', 'الفئة')}</Label>
              <Controller
                name="category"
                control={control}
                rules={{ required: t('Please select a category', 'يرجى اختيار فئة') }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select category', 'اختر الفئة')} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('Level', 'المستوى')}</Label>
              <Controller
                name="level"
                control={control}
                rules={{ required: t('Please select a level', 'يرجى اختيار مستوى') }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select level', 'اختر المستوى')} />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.level && (
                <p className="text-sm text-destructive">{errors.level.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t('Price ($)', 'السعر ($)')}</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                {...register('price', { 
                  required: t('Price is required', 'السعر مطلوب'),
                  min: {
                    value: 0,
                    message: t('Price cannot be negative', 'السعر لا يمكن أن يكون سالباً')
                  }
                })}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">{t('Duration (hours)', 'المدة (ساعات)')}</Label>
              <Input
                id="estimatedDuration"
                type="number"
                min="0"
                step="0.5"
                {...register('estimatedDuration', { 
                  required: t('Duration is required', 'المدة مطلوبة'),
                  min: {
                    value: 0.5,
                    message: t('Duration must be at least 0.5 hours', 'المدة يجب أن تكون نصف ساعة على الأقل')
                  }
                })}
              />
              {errors.estimatedDuration && (
                <p className="text-sm text-destructive">{errors.estimatedDuration.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">{t('Thumbnail URL', 'رابط الصورة المصغرة')}</Label>
            <Input
              id="thumbnail"
              type="url"
              placeholder="https://example.com/image.jpg"
              {...register('thumbnail')}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('Status', 'الحالة')}</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Select status', 'اختر الحالة')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t('Draft', 'مسودة')}</SelectItem>
                    <SelectItem value="published">{t('Published', 'منشور')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading 
              ? t('Saving...', 'جارٍ الحفظ...') 
              : isEdit 
                ? t('Update Course', 'تحديث الدورة')
                : t('Create Course', 'إنشاء الدورة')
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CourseForm;
