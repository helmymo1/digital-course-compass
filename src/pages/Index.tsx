
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
  try {
    const response = await fetch('/api/v1/courses?sortBy=enrollmentCount&order=desc&limit=4&status=published');
    
    // Check if the response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('API returned non-JSON response, using fallback data');
      throw new Error('API not available');
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch popular courses');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('API not available, using fallback data:', error);
    // Return fallback data when API is not available
    return {
      courses: [
        {
          _id: '1',
          title: 'Complete Web Development Bootcamp',
          description: 'Learn web development from scratch with HTML, CSS, JavaScript, and React',
          instructor: { _id: '1', name: 'John Smith', email: 'john@example.com' },
          price: 99,
          originalPrice: 199,
          image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop',
          category: 'Web Development',
          level: 'beginner',
          estimatedDurationHours: 40,
          averageRating: 4.8,
          enrollmentCount: 15420,
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'Advanced React & Node.js',
          description: 'Master advanced React concepts and build full-stack applications',
          instructor: { _id: '2', name: 'Sarah Johnson', email: 'sarah@example.com' },
          price: 129,
          image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop',
          category: 'Web Development',
          level: 'advanced',
          estimatedDurationHours: 35,
          averageRating: 4.9,
          enrollmentCount: 8930,
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '3',
          title: 'Data Science with Python',
          description: 'Learn data science fundamentals with Python and popular libraries',
          instructor: { _id: '3', name: 'Michael Chen', email: 'michael@example.com' },
          price: 0,
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
          category: 'Data Science',
          level: 'intermediate',
          estimatedDurationHours: 50,
          averageRating: 4.7,
          enrollmentCount: 12650,
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '4',
          title: 'UI/UX Design Masterclass',
          description: 'Master user interface and user experience design principles',
          instructor: { _id: '4', name: 'Emily Rodriguez', email: 'emily@example.com' },
          price: 89,
          originalPrice: 149,
          image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
          category: 'Design',
          level: 'beginner',
          estimatedDurationHours: 30,
          averageRating: 4.8,
          enrollmentCount: 9870,
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    };
  }
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
