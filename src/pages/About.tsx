
import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Award, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();

  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: t('ceo_founder'),
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b593?w=300&h=300&fit=crop&crop=face'
    },
    {
      name: 'Michael Chen',
      role: t('cto'),
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face'
    },
    {
      name: 'Emily Rodriguez',
      role: t('head_of_education'),
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face'
    },
    {
      name: 'David Thompson',
      role: t('lead_developer'),
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face'
    }
  ];

  const values = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: t('community_first'),
      description: t('community_first_desc')
    },
    {
      icon: <Target className="h-8 w-8 text-green-600" />,
      title: t('goal_oriented'),
      description: t('goal_oriented_desc')
    },
    {
      icon: <Award className="h-8 w-8 text-purple-600" />,
      title: t('excellence'),
      description: t('excellence_desc')
    },
    {
      icon: <Heart className="h-8 w-8 text-red-600" />,
      title: t('passion'),
      description: t('passion_desc')
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('our_story')}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('our_story_desc')}
          </p>
        </div>

        {/* Vision Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-4">{t('our_vision')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('our_vision_desc')}
            </p>
            <p className="text-muted-foreground">
              {t('our_impact_desc')}
            </p>
          </div>
          <div>
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop" 
              alt="Students learning together"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">{t('our_values')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-12">{t('meet_our_team')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
