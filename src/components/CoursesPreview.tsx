
import React from 'react';
import { Button } from '@/components/ui/button';
import CourseCard from '@/components/CourseCard';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CoursesPreview = () => {
  const featuredCourses = [
    {
      id: '1',
      title: 'Complete Web Development Bootcamp',
      instructor: 'John Smith',
      price: 99,
      originalPrice: 199,
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop',
      rating: 4.8,
      totalStudents: 15420,
      duration: '40 hours',
      category: 'Web Development',
      level: 'Beginner' as const
    },
    {
      id: '2',
      title: 'Advanced React & Node.js',
      instructor: 'Sarah Johnson',
      price: 129,
      image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop',
      rating: 4.9,
      totalStudents: 8930,
      duration: '35 hours',
      category: 'Web Development',
      level: 'Advanced' as const
    },
    {
      id: '3',
      title: 'Data Science with Python',
      instructor: 'Michael Chen',
      price: 0,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
      rating: 4.7,
      totalStudents: 12650,
      duration: '50 hours',
      category: 'Data Science',
      level: 'Intermediate' as const
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Courses</h2>
          <p className="text-xl text-muted-foreground">
            Discover our most popular courses and start your learning journey today
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredCourses.map(course => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>

        <div className="text-center">
          <Link to="/courses">
            <Button size="lg" className="group">
              View All Courses
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CoursesPreview;
