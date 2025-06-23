
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Clock, Users, BookOpen, Award, HeadphonesIcon } from 'lucide-react';

const FeatureSection = () => {
  const features = [
    {
      icon: GraduationCap,
      title: 'Expert Instructors',
      description: 'Learn from industry professionals and certified experts who bring real-world experience to every lesson.'
    },
    {
      icon: Clock,
      title: 'Flexible Learning',
      description: 'Study at your own pace with 24/7 access to course materials. Perfect for busy schedules and different learning styles.'
    },
    {
      icon: Users,
      title: 'Interactive Content',
      description: 'Engage with hands-on projects, quizzes, and community discussions to enhance your learning experience.'
    },
    {
      icon: BookOpen,
      title: 'Comprehensive Curriculum',
      description: 'Access structured learning paths designed to take you from beginner to expert in your chosen field.'
    },
    {
      icon: Award,
      title: 'Certificates & Recognition',
      description: 'Earn verified certificates upon completion to showcase your skills to employers and advance your career.'
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Get help whenever you need it with our dedicated support team and active community forums.'
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the features that make learning effective, engaging, and accessible for everyone.
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
