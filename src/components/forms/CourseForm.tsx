
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';

interface CourseData {
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  level: string;
  price: number;
  originalPrice: number;
  duration: string;
  language: string;
  prerequisites: string[];
  learningOutcomes: string[];
  tags: string[];
  isPublished: boolean;
  allowEnrollment: boolean;
  maxStudents: number;
  startDate: string;
  endDate: string;
  thumbnailUrl: string;
  videoIntroUrl: string;
}

interface CourseFormProps {
  initialData?: Partial<CourseData>;
  onSubmit: (data: CourseData) => void;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

const CourseForm = ({ initialData, onSubmit, isLoading, mode }: CourseFormProps) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<CourseData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    shortDescription: initialData?.shortDescription || '',
    category: initialData?.category || '',
    level: initialData?.level || 'beginner',
    price: initialData?.price || 0,
    originalPrice: initialData?.originalPrice || 0,
    duration: initialData?.duration || '',
    language: initialData?.language || 'english',
    prerequisites: initialData?.prerequisites || [],
    learningOutcomes: initialData?.learningOutcomes || [],
    tags: initialData?.tags || [],
    isPublished: initialData?.isPublished || false,
    allowEnrollment: initialData?.allowEnrollment || true,
    maxStudents: initialData?.maxStudents || 0,
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    thumbnailUrl: initialData?.thumbnailUrl || '',
    videoIntroUrl: initialData?.videoIntroUrl || '',
  });

  const [prerequisiteInput, setPrerequisiteInput] = useState('');
  const [outcomeInput, setOutcomeInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const handleInputChange = <K extends keyof CourseData>(
    field: K,
    value: CourseData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addPrerequisite = () => {
    if (prerequisiteInput.trim()) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, prerequisiteInput.trim()]
      }));
      setPrerequisiteInput('');
    }
  };

  const removePrerequisite = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const addOutcome = () => {
    if (outcomeInput.trim()) {
      setFormData(prev => ({
        ...prev,
        learningOutcomes: [...prev.learningOutcomes, outcomeInput.trim()]
      }));
      setOutcomeInput('');
    }
  };

  const removeOutcome = (index: number) => {
    setFormData(prev => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? t('Create New Course') : t('Edit Course')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('Basic Information')}</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">{t('Course Title')}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={t('Enter course title')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">{t('Short Description')}</Label>
              <Textarea
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                placeholder={t('Brief description for course preview')}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('Full Description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t('Detailed course description')}
                rows={6}
                required
              />
            </div>
          </div>

          {/* Course Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('Course Details')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">{t('Category')}</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Select category')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programming">{t('Programming')}</SelectItem>
                    <SelectItem value="design">{t('Design')}</SelectItem>
                    <SelectItem value="business">{t('Business')}</SelectItem>
                    <SelectItem value="marketing">{t('Marketing')}</SelectItem>
                    <SelectItem value="language">{t('Language')}</SelectItem>
                    <SelectItem value="other">{t('Other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">{t('Level')}</Label>
                <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">{t('Beginner')}</SelectItem>
                    <SelectItem value="intermediate">{t('Intermediate')}</SelectItem>
                    <SelectItem value="advanced">{t('Advanced')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">{t('Price')} ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalPrice">{t('Original Price')} ($)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">{t('Duration')}</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder={t('e.g., 10 weeks, 40 hours')}
                />
              </div>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('Prerequisites')}</h3>
            <div className="flex space-x-2">
              <Input
                value={prerequisiteInput}
                onChange={(e) => setPrerequisiteInput(e.target.value)}
                placeholder={t('Add a prerequisite')}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
              />
              <Button type="button" onClick={addPrerequisite}>
                {t('Add')}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.prerequisites.map((prereq, index) => (
                <div key={index} className="bg-muted px-3 py-1 rounded-md flex items-center space-x-2">
                  <span>{prereq}</span>
                  <button type="button" onClick={() => removePrerequisite(index)} className="text-red-500 hover:text-red-700">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Outcomes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('Learning Outcomes')}</h3>
            <div className="flex space-x-2">
              <Input
                value={outcomeInput}
                onChange={(e) => setOutcomeInput(e.target.value)}
                placeholder={t('Add a learning outcome')}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOutcome())}
              />
              <Button type="button" onClick={addOutcome}>
                {t('Add')}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.learningOutcomes.map((outcome, index) => (
                <div key={index} className="bg-muted px-3 py-1 rounded-md flex items-center space-x-2">
                  <span>{outcome}</span>
                  <button type="button" onClick={() => removeOutcome(index)} className="text-red-500 hover:text-red-700">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('Tags')}</h3>
            <div className="flex space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder={t('Add a tag')}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag}>
                {t('Add')}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="bg-muted px-3 py-1 rounded-md flex items-center space-x-2">
                  <span>{tag}</span>
                  <button type="button" onClick={() => removeTag(index)} className="text-red-500 hover:text-red-700">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('Settings')}</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
                />
                <Label htmlFor="isPublished">{t('Publish Course')}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowEnrollment"
                  checked={formData.allowEnrollment}
                  onCheckedChange={(checked) => handleInputChange('allowEnrollment', checked)}
                />
                <Label htmlFor="allowEnrollment">{t('Allow Enrollment')}</Label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2 pt-6">
            <Button type="button" variant="outline" disabled={isLoading}>
              {t('Cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading 
                ? t('Saving...') 
                : mode === 'create' 
                  ? t('Create Course') 
                  : t('Update Course')
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CourseForm;
