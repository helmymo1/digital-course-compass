import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, History } from 'lucide-react'; // History icon might be suitable
import { getRecentlyViewedCourseIds, addRecentlyViewedCourse } from '@/lib/recentlyViewed'; // Assuming path is correct

// Define a type for the course structure, similar to what's used elsewhere
interface Course {
  id: string;
  title: string;
  instructor: string;
  image: string; // URL to course image
  level: string;
  // Add any other relevant fields for a compact display
}

// Mock function to fetch course details by IDs
// In a real app, this would be an API call: `fetch('/api/courses/batch?ids=' + ids.join(','))`
const fetchCourseDetailsByIds = async (ids: string[]): Promise<Course[]> => {
  if (ids.length === 0) {
    return [];
  }
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock course data store
  const allMockCourses: Course[] = [
    { id: '1', title: 'Complete Web Development Bootcamp', instructor: 'John Smith', image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=150&h=100&fit=crop', level: 'Beginner' },
    { id: '2', title: 'Advanced React & Node.js', instructor: 'Sarah Johnson', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&h=100&fit=crop', level: 'Advanced' },
    { id: 'rec1', title: 'AI for Everyone', instructor: 'Andrew Ng', image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=150&h=100&fit=crop', level: 'Beginner' },
    { id: 'pop1', title: 'The Complete 2024 Web Development Bootcamp', instructor: 'Dr. Angela Yu', image: 'https://images.unsplash.com/photo-1509966756634-9c23dd6e6914?w=150&h=100&fit=crop', level: 'All Levels' },
    { id: 'courseX', title: 'Another Interesting Course', instructor: 'Jane Doe', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=150&h=100&fit=crop', level: 'Intermediate' },
  ];

  return ids.map(id => allMockCourses.find(course => course.id === id)).filter(course => course !== undefined) as Course[];
};


const RecentlyViewedCourses: React.FC = () => {
  const [viewedCourses, setViewedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecentlyViewed = async () => {
      setLoading(true);
      setError(null);
      try {
        const courseIds = getRecentlyViewedCourseIds();
        if (courseIds.length > 0) {
          const coursesData = await fetchCourseDetailsByIds(courseIds);
          // Ensure the order from localStorage (most recent first) is preserved
          const sortedCourses = courseIds.map(id => coursesData.find(c => c.id === id)).filter(c => c) as Course[];
          setViewedCourses(sortedCourses);
        } else {
          setViewedCourses([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error("Error loading recently viewed courses:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRecentlyViewed();

    // Optional: Add some dummy data for demonstration if localStorage is empty
    // This should ideally be done where courses are viewed, e.g., CourseDetails page.
    // if (process.env.NODE_ENV === 'development' && getRecentlyViewedCourseIds().length === 0) {
    //   addRecentlyViewedCourse('1');
    //   addRecentlyViewedCourse('rec1');
    //   addRecentlyViewedCourse('pop1');
    //   loadRecentlyViewed(); // Reload to see them
    // }

  }, []);

  // This is a helper for development to easily add items to recently viewed
  const addTestData = () => {
    addRecentlyViewedCourse('1');
    addRecentlyViewedCourse('2');
    addRecentlyViewedCourse('rec1');
    // Trigger a re-fetch/re-render. In a real app, this would be implicit.
    // Forcing a reload of data for the component:
    const courseIds = getRecentlyViewedCourseIds();
    fetchCourseDetailsByIds(courseIds).then(coursesData => {
        const sortedCourses = courseIds.map(id => coursesData.find(c => c.id === id)).filter(c => c) as Course[];
        setViewedCourses(sortedCourses);
    });
  };


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <History className="h-5 w-5 mr-2 text-primary" />
            Recently Viewed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading recently viewed courses...</p>
          {/* Add skeleton loaders if desired */}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <History className="h-5 w-5 mr-2 text-primary" />
            Recently Viewed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (viewedCourses.length === 0) {
    return (
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <History className="h-5 w-5 mr-2 text-primary" />
            Recently Viewed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>You haven't viewed any courses recently.</p>
          {/* For development: Button to add test data */}
          {process.env.NODE_ENV === 'development' && (
            <Button onClick={addTestData} className="mt-2" variant="outline" size="sm">Add Test Recently Viewed</Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <History className="h-5 w-5 mr-2 text-primary" />
          Recently Viewed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent">
          {viewedCourses.map((course) => (
            <div key={course.id} className="flex-shrink-0 w-64"> {/* Fixed width for horizontal scroll items */}
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-32 object-cover"
                />
                <div className="p-3">
                  <h4 className="text-sm font-semibold line-clamp-2 mb-1">{course.title}</h4>
                  <p className="text-xs text-muted-foreground mb-1">By {course.instructor}</p>
                  <Badge variant="secondary" className="text-xs">{course.level}</Badge>
                  {/* <Button variant="link" size="sm" className="mt-1 p-0 h-auto">View</Button> */}
                </div>
              </Card>
            </div>
          ))}
        </div>
         {/* For development: Button to add test data */}
         {process.env.NODE_ENV === 'development' && (
            <Button onClick={addTestData} className="mt-2" variant="outline" size="sm">Add Test Recently Viewed</Button>
          )}
      </CardContent>
    </Card>
  );
};

export default RecentlyViewedCourses;
