import React, { useState, useEffect } from 'react';
import { useWishlist } from '@/contexts/WishlistContext'; // Adjust path
import Navigation from '@/components/Navigation'; // Assuming a global navigation component
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Users, Trash2 } from 'lucide-react';
import WishlistButton from '@/components/WishlistButton'; // Import the button

// Define a type for the course structure, similar to what's used elsewhere
interface Course {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  totalRatings: number;
  price: number;
  originalPrice?: number;
  duration: string;
  students: number;
  level: string;
  image: string; // URL to course image
  description?: string; // Short description
}

// Mock function to fetch course details by IDs (re-using a similar pattern)
const fetchCourseDetailsByIds = async (ids: string[]): Promise<Course[]> => {
  if (ids.length === 0) return [];
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

  const allMockCourses: Course[] = [
    { id: '1', title: 'Complete Web Development Bootcamp', instructor: 'John Smith', rating: 4.8, totalRatings: 12500, price: 89, duration: '52 hours', students: 45000, level: 'Beginner', image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop', description: 'Learn full-stack web development with HTML, CSS, JavaScript, React, Node.js, and more.' },
    { id: '2', title: 'Advanced React & Node.js', instructor: 'Sarah Johnson', rating: 4.9, totalRatings: 8900, price: 149, duration: '35 hours', students: 28000, level: 'Advanced', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop', description: 'Dive deep into advanced React patterns and Node.js best practices.' },
    { id: 'rec1', title: 'AI for Everyone', instructor: 'Andrew Ng', rating: 4.9, totalRatings: 15000, price: 49, duration: '12 hours', students: 75000, level: 'Beginner', image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=300&h=200&fit=crop', description: 'Understand AI fundamentals and its applications without requiring a technical background.' },
    { id: 'pop1', title: 'The Complete 2024 Web Development Bootcamp', instructor: 'Dr. Angela Yu', rating: 4.9, totalRatings: 250000, price: 129, duration: '60 hours', students: 850000, level: 'All Levels', image: 'https://images.unsplash.com/photo-1509966756634-9c23dd6e6914?w=300&h=200&fit=crop', description: 'Become a full-stack web developer. Covers HTML, CSS, Javascript, Node, React, MongoDB and more!' },
  ];

  return ids.map(id => allMockCourses.find(course => course.id === id)).filter(course => course !== undefined) as Course[];
};


const WishlistPage: React.FC = () => {
  const { wishlistItems, removeFromWishlist, loading: wishlistContextLoading, error: wishlistContextError } = useWishlist();
  const [wishlistCourses, setWishlistCourses] = useState<Course[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    if (wishlistItems.length > 0) {
      setLoadingDetails(true);
      setErrorDetails(null);
      fetchCourseDetailsByIds(wishlistItems)
        .then(courses => {
          // Preserve order from wishlistItems if necessary, though API might not guarantee it
          const sortedCourses = wishlistItems.map(id => courses.find(c => c.id === id)).filter(c => c) as Course[];
          setWishlistCourses(sortedCourses);
        })
        .catch(err => {
          console.error("Error fetching wishlist course details:", err);
          setErrorDetails("Failed to load course details for your wishlist.");
        })
        .finally(() => setLoadingDetails(false));
    } else {
      setWishlistCourses([]); // Clear courses if wishlist is empty
    }
  }, [wishlistItems]);

  const handleRemoveFromWishlist = async (courseId: string) => {
    await removeFromWishlist(courseId); // This will trigger re-fetch via context's effect on wishlistItems
  };

  const isLoading = wishlistContextLoading || loadingDetails;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          {/* Potential: Add sorting or filtering options here */}
        </div>

        {isLoading && <p>Loading your wishlist...</p>}
        {wishlistContextError && <p className="text-red-500">Error: {wishlistContextError}</p>}
        {errorDetails && <p className="text-red-500">Error loading details: {errorDetails}</p>}

        {!isLoading && !wishlistContextError && wishlistCourses.length === 0 && (
          <div className="text-center py-10">
            <Heart className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty.</h2>
            <p className="text-muted-foreground mb-4">Add courses you're interested in to find them easily later.</p>
            <Button onClick={() => { /* Navigate to courses page, e.g. router.push('/courses') */ }}>
              Explore Courses
            </Button>
          </div>
        )}

        {!isLoading && !wishlistContextError && wishlistCourses.length > 0 && (
          <div className="space-y-6">
            {wishlistCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <CardContent className="p-0 md:p-6"> {/* No padding on mobile, padding on md+ */}
                  <div className="md:flex gap-6">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-48 md:w-64 md:h-40 object-cover md:rounded-lg flex-shrink-0"
                    />

                    <div className="flex-1 p-4 md:p-0 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                           <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                            {/* <Link to={`/courses/${course.id}`}>{course.title}</Link> */}
                            {course.title}
                           </h3>
                           <p className="text-sm text-muted-foreground">By {course.instructor}</p>
                        </div>
                        {/* Wishlist button is already part of Course Card, or can be added explicitly */}
                         <WishlistButton courseId={course.id} size="sm" className="mt-1 md:mt-0"/>
                         {/* Alternative direct remove button:
                         <Button variant="ghost" size="icon" onClick={() => handleRemoveFromWishlist(course.id)} aria-label="Remove from wishlist">
                            <Trash2 className="h-5 w-5 text-destructive" />
                         </Button>
                         */}
                      </div>

                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{course.rating}</span>
                          <span className="text-muted-foreground">({course.totalRatings.toLocaleString()})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{course.students.toLocaleString()}</span>
                        </div>
                        <Badge variant="secondary">{course.level}</Badge>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>

                       <div className="flex items-center justify-between pt-2">
                        <div className="text-2xl font-bold">${course.price}</div>
                        <Button >Go to Course</Button> {/* Or "Add to Cart" */}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
