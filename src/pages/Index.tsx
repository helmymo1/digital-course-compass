
import React from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import CoursesPreview from '@/components/CoursesPreview';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <CoursesPreview />
        <FeatureSection />
        <TestimonialsCarousel />
      </main>
    </div>
  );
};

export default Index;
