
import React from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <FeatureSection />
        <TestimonialsCarousel />
      </main>
    </div>
  );
};

export default Index;
