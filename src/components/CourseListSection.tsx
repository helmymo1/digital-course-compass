
import React from 'react';
import CourseCard from '@/components/CourseCard';
import { Course } from '@/types/course';

interface CourseListSectionProps {
  title: string;
  courses: Course[];
  onViewDetails: (courseId: string) => void;
  isLoading?: boolean;
  error?: Error | null;
  emptyStateMessage?: string;
}

const CourseListSection: React.FC<CourseListSectionProps> = ({
  title,
  courses,
  onViewDetails,
  isLoading = false,
  error = null,
  emptyStateMessage = "No courses to display in this section."
}) => {
  if (isLoading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <p>Loading courses...</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
             <div key={i} className="animate-pulse bg-muted rounded-lg p-4 h-[300px]">
                <div className="h-32 bg-muted-foreground/20 rounded mb-3"></div>
                <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted-foreground/20 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted-foreground/20 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <p className="text-red-500">Error loading courses: {error.message}</p>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <p className="text-muted-foreground">{emptyStateMessage}</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {courses.map(course => (
          <CourseCard
            key={course.id || course._id}
            id={course.id || course._id}
            title={course.title}
            instructor={typeof course.instructor === 'string' ? course.instructor : course.instructor.name}
            price={course.price}
            originalPrice={course.originalPrice}
            image={course.image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop'}
            rating={course.rating || course.averageRating}
            totalStudents={course.totalStudents || course.enrollmentCount}
            duration={course.duration || (course.estimatedDurationHours ? `${course.estimatedDurationHours} hours` : 'N/A')}
            level={course.level}
            category={course.category}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
};

export default CourseListSection;
