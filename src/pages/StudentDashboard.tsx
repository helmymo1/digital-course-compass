
import React from 'react';
import Navigation from '@/components/Navigation';
import StudentProgressDashboard from '@/components/analytics/StudentProgressDashboard';
import { useLanguage } from '@/contexts/LanguageContext';

const StudentDashboard = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Learning Dashboard</h1>
          <p className="text-muted-foreground">Track your progress and achievements</p>
        </div>

        <StudentProgressDashboard />
      </div>
    </div>
  );
};

export default StudentDashboard;
