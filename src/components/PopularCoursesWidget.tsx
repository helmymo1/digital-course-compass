import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // CardHeader, CardTitle for widget look
import { Badge } from '@/components/ui/badge';
import { Star, Users, TrendingUp } from 'lucide-react'; // TrendingUp for "popular"
import { Button } from './ui/button';

// Using the same Course type as RecommendedCourses for consistency
interface Course {
  id: string;
  title: string;
  instructor: string; // Added instructor
  rating: number;
  students: number; // Using students as a proxy for popularity
  level: string;
  image: string;
  price?: number;
}

const PopularCoursesWidget: React.FC = () => {
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API call to /api/courses/popular
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

        // Mock data - replace with API response
        const mockData: Course[] = [
          {
            id: 'pop1',
            title: 'The Complete 2024 Web Development Bootcamp',
            instructor: 'Dr. Angela Yu',
            rating: 4.9,
            students: 250000,
            level: 'All Levels',
            image: 'https://images.unsplash.com/photo-1509966756634-9c23dd6e6914?w=300&h=200&fit=crop',
            price: 129,
          },
          {
            id: 'pop2',
            title: 'Machine Learning A-Z™: AI, Python & R',
            instructor: 'Kirill Eremenko, Hadelin de Ponteves',
            rating: 4.7,
            students: 180000,
            level: 'Intermediate',
            image: 'https://images.unsplash.com/photo-1526660690293-bcd32dc3b123?w=300&h=200&fit=crop',
            price: 119,
          },
          {
            id: 'pop3',
            title: 'React - The Complete Guide (incl Hooks, React Router, Redux)',
            instructor: 'Maximilian Schwarzmüller',
            rating: 4.8,
            students: 220000,
            level: 'Advanced',
            image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop',
            price: 139,
          },
           {
            id: 'pop4',
            title: 'Graphic Design Masterclass - Learn GREAT Design',
            instructor: 'Lindsay Marsh',
            rating: 4.6,
            students: 95000,
            level: 'Beginner',
            image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=300&h=200&fit=crop',
            price: 89,
          }
        ];
        // Simulate showing top 3-4 popular courses for a widget
        setPopularCourses(mockData.slice(0, 4));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error("Error fetching popular courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularCourses();
  }, []); // Runs once on component mount

  const renderSkeleton = () => (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="w-full h-32 bg-gray-300 rounded animate-pulse mb-3"></div>
        <div className="h-5 bg-gray-300 rounded w-3/4 animate-pulse mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse mb-1"></div>
        <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-primary" />
            Popular Courses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => renderSkeleton())}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-primary" />
            Popular Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error loading popular courses: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (popularCourses.length === 0) {
    return null; // Or a message like "No popular courses to show"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-6 w-6 mr-2 text-primary" />
          Popular Courses
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {popularCourses.map((course) => (
          <div key={course.id} className="flex items-start gap-4 p-3 hover:bg-muted/50 rounded-md transition-colors">
            <img
              src={course.image}
              alt={course.title}
              className="w-28 h-20 object-cover rounded-md flex-shrink-0"
            />
            <div className="flex-1">
              <h4 className="text-md font-semibold line-clamp-2 leading-tight mb-1">{course.title}</h4>
              <p className="text-xs text-muted-foreground mb-1">By {course.instructor}</p>
              <div className="flex items-center gap-2 text-xs mb-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{course.rating}</span>
                <Users className="h-3 w-3 text-muted-foreground" />
                <span>{course.students.toLocaleString()} students</span>
              </div>
              <Badge variant="outline" className="text-xs">{course.level}</Badge>
            </div>
            {/* <Button variant="ghost" size="sm" className="self-center">View</Button> */}
          </div>
        ))}
        <Button variant="outline" className="w-full mt-2">View All Popular Courses</Button>
      </CardContent>
    </Card>
  );
};

export default PopularCoursesWidget;
