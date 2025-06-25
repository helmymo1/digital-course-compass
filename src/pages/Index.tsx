
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import CourseListSection from '@/components/CourseListSection';
import { Course } from '@/types/course';

interface PopularCoursesApiResponse {
  courses: Course[];
}

const fetchPopularCourses = async (): Promise<PopularCoursesApiResponse> => {
  const response = await fetch('/api/v1/courses?sortBy=enrollmentCount&order=desc&limit=4&status=published');
  if (!response.ok) {
    throw new Error('Failed to fetch popular courses');
  }
  const data = await response.json();
  return data;
};

const Index = () => {
  const navigate = useNavigate();

  const {
    data: popularCoursesData,
    isLoading: isLoadingPopular,
    error: errorPopular
  } = useQuery({
    queryKey: ['popularCourses'],
    queryFn: fetchPopularCourses
  });

  const handleViewCourseDetails = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const popularCoursesForDisplay = popularCoursesData?.courses.map(course => ({
    ...course,
    id: course._id,
    rating: course.averageRating,
    totalStudents: course.enrollmentCount,
    duration: course.estimatedDurationHours ? `${course.estimatedDurationHours} hours` : 'N/A',
    image: course.image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop'
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />

        <div className="container mx-auto px-4 py-12">
          <CourseListSection
            title="Popular Courses"
            courses={popularCoursesForDisplay}
            isLoading={isLoadingPopular}
            error={errorPopular}
            onViewDetails={handleViewCourseDetails}
            emptyStateMessage="No popular courses available at the moment."
          />
        </div>

        <TestimonialsCarousel />
      </main>
    </div>
  );
};

export default Index;
