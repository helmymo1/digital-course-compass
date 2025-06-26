import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Users } from 'lucide-react';
import { Button } from './ui/button'; // Assuming button is in ui

// Define a type for the course structure, similar to what's used elsewhere
interface Course {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  totalRatings: number;
  price?: number; // Optional, as some recommendations might be free or already owned
  originalPrice?: number;
  duration: string;
  students: number;
  level: string;
  image: string; // URL to course image
  // Add any other relevant fields
}

interface RecommendedCoursesProps {
  userId: string;
}

const RecommendedCourses: React.FC<RecommendedCoursesProps> = ({ userId }) => {
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API call
        // Replace with: const response = await fetch(`/api/recommendations/${userId}`);
        // if (!response.ok) throw new Error('Failed to fetch recommendations');
        // const data = await response.json();

        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

        // Mock data - replace with API response
        const mockData: Course[] = [
          {
            id: 'rec1',
            title: 'AI for Everyone',
            instructor: 'Andrew Ng',
            rating: 4.9,
            totalRatings: 15000,
            price: 49,
            duration: '12 hours',
            students: 75000,
            level: 'Beginner',
            image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=300&h=200&fit=crop',
          },
          {
            id: 'rec2',
            title: 'Python for Data Science and Machine Learning Bootcamp',
            instructor: 'Jose Portilla',
            rating: 4.7,
            totalRatings: 120000,
            price: 99,
            duration: '45 hours',
            students: 450000,
            level: 'Intermediate',
            image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=300&h=200&fit=crop',
          },
          {
            id: 'rec3',
            title: 'The Complete JavaScript Course 2024: From Zero to Expert!',
            instructor: 'Jonas Schmedtmann',
            rating: 4.8,
            totalRatings: 95000,
            price: 79,
            duration: '68 hours',
            students: 350000,
            level: 'All Levels',
            image: 'https://images.unsplash.com/photo-1526379095098-d65658bf08be?w=300&h=200&fit=crop',
          }
        ];
        setRecommendations(mockData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRecommendations();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Recommended For You</h2>
        {/* Skeleton Loaders */}
        {[1, 2, 3].map(i => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-40 h-24 bg-gray-300 rounded animate-pulse"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recommended For You</h2>
        <p className="text-red-500">Error loading recommendations: {error}</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recommended For You</h2>
        <p>No recommendations available at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Recommended For You</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((course) => (
          <Card key={course.id} className="overflow-hidden flex flex-col">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-48 object-cover"
            />
            <CardContent className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-semibold mb-1 line-clamp-2">{course.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">By {course.instructor}</p>

              <div className="flex items-center gap-2 text-sm mb-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{course.rating}</span>
                <span className="text-muted-foreground">({course.totalRatings.toLocaleString()})</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
                <Users className="h-4 w-4" />
                <span>{course.students.toLocaleString()}</span>
              </div>

              <Badge variant="secondary" className="w-fit mb-3">{course.level}</Badge>

              <div className="mt-auto flex items-center justify-between">
                {course.price !== undefined ? (
                   <p className="text-xl font-bold">${course.price}</p>
                ) : (
                  <p className="text-lg font-semibold text-green-600">Free</p>
                )}
                <Button size="sm">View Course</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecommendedCourses;
