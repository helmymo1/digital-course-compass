
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom'; // For navigation
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
// import CoursesPreview from '@/components/CoursesPreview'; // Will replace this with CourseListSection
import CourseListSection from '@/components/CourseListSection';
import { Course } from '@/pages/Courses'; // Reuse Course type

interface PopularCoursesApiResponse {
  courses: Course[]; // Assuming the API returns a list of courses directly under 'courses' key
  // Add other API response fields if necessary, e.g., totalCourses, etc.
}

const fetchPopularCourses = async (): Promise<PopularCoursesApiResponse> => {
  // Fetch top 4 popular courses
  const response = await fetch('/api/v1/courses?sortBy=enrollmentCount&order=desc&limit=4&status=published');
  if (!response.ok) {
    throw new Error('Failed to fetch popular courses');
  }
  // The courses API returns { courses: [], currentPage, totalPages, totalCourses }
  // We need to adapt this if CourseListSection expects just an array.
  // For now, assuming CourseListSection can handle the structure or we adapt it.
  // Let's assume the API returns the structure { courses: Course[] } for simplicity or that we adjust the fetch.
  const data = await response.json();
  return data; // Expects { courses: Course[], ... }
};


const Index = () => {
  const navigate = useNavigate();

  const {
    data: popularCoursesData,
    isLoading: isLoadingPopular,
    error: errorPopular
  } = useQuery<PopularCoursesApiResponse, Error>(['popularCourses'], fetchPopularCourses);

  const handleViewCourseDetails = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  // Map courses for CourseListSection, similar to Courses.tsx
  const popularCoursesForDisplay = popularCoursesData?.courses.map(course => ({
    ...course,
    id: course._id, // Map _id to id
    rating: course.averageRating,
    totalStudents: course.enrollmentCount,
    duration: course.estimatedDurationHours ? `${course.estimatedDurationHours} hours` : 'N/A',
    image: course.image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop' // Placeholder
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
