
import React from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import CoursesPreview from '@/components/CoursesPreview';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <CoursesPreview />
        <TestimonialsCarousel />
      </main>
    </div>
  );
};

export default Index;
