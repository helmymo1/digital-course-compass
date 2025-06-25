
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Clock, Users, BookOpen, Award, HeadphonesIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const FeatureSection = () => {
  const { t } = useLanguage();
  const features = [
    {
      icon: GraduationCap,
      title: t('expert_instructors_feature_title'),
      description: t('expert_instructors_feature_desc')
    },
    {
      icon: Clock,
      title: t('flexible_learning_feature_title'),
      description: t('flexible_learning_feature_desc')
    },
    {
      icon: Users,
      title: t('interactive_content_feature_title'),
      description: t('interactive_content_feature_desc')
    },
    {
      icon: BookOpen,
      title: t('comprehensive_curriculum_feature_title'),
      description: t('comprehensive_curriculum_feature_desc')
    },
    {
      icon: Award,
      title: t('certificates_recognition_feature_title'),
      description: t('certificates_recognition_feature_desc')
    },
    {
      icon: HeadphonesIcon,
      title: t('support_24_7_feature_title'),
      description: t('support_24_7_feature_desc')
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('why_choose_platform_title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('why_choose_platform_desc')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-200 group">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
