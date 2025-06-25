
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import CourseComparison from '@/components/search/CourseComparison';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Users, Plus, Minus } from 'lucide-react';

const SearchResults = () => {
  const [searchResults, setSearchResults] = useState([
    {
      id: '1',
      title: 'Complete Web Development Bootcamp',
      instructor: 'John Smith',
      rating: 4.8,
      totalRatings: 12500,
      price: 89,
      originalPrice: 199,
      duration: '52 hours',
      students: 45000,
      level: 'Beginner',
      language: 'English',
      lastUpdated: '2024-01-15',
      features: ['Certificates', 'Lifetime Access', 'Mobile Access', 'Downloadable Resources'],
      curriculum: ['HTML & CSS Basics', 'JavaScript Fundamentals', 'React.js', 'Node.js', 'Database Design'],
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop'
    },
    {
      id: '2',
      title: 'Advanced React & Node.js',
      instructor: 'Sarah Johnson',
      rating: 4.9,
      totalRatings: 8900,
      price: 149,
      originalPrice: 299,
      duration: '35 hours',
      students: 28000,
      level: 'Advanced',
      language: 'English',
      lastUpdated: '2024-02-01',
      features: ['Certificates', 'Lifetime Access', 'Mobile Access', 'Live Sessions'],
      curriculum: ['Advanced React Patterns', 'Node.js Best Practices', 'GraphQL', 'Testing', 'Deployment'],
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop'
    }
  ]);

  const [comparisonCourses, setComparisonCourses] = useState<typeof searchResults>([]);
  const [showComparison, setShowComparison] = useState(false);

  const handleSearch = (filters: any) => {
    console.log('Search filters:', filters);
    // In a real app, you would make an API call here
    // For now, we'll just filter the existing results
    const filtered = searchResults.filter(course => {
      if (filters.query && !course.title.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }
      if (filters.level && course.level !== filters.level) {
        return false;
      }
      if (filters.rating && course.rating < filters.rating) {
        return false;
      }
      return true;
    });
    setSearchResults(filtered);
  };

  const handleReset = () => {
    // Reset to original results
    setSearchResults([
      {
        id: '1',
        title: 'Complete Web Development Bootcamp',
        instructor: 'John Smith',
        rating: 4.8,
        totalRatings: 12500,
        price: 89,
        originalPrice: 199,
        duration: '52 hours',
        students: 45000,
        level: 'Beginner',
        language: 'English',
        lastUpdated: '2024-01-15',
        features: ['Certificates', 'Lifetime Access', 'Mobile Access', 'Downloadable Resources'],
        curriculum: ['HTML & CSS Basics', 'JavaScript Fundamentals', 'React.js', 'Node.js', 'Database Design'],
        image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop'
      },
      {
        id: '2',
        title: 'Advanced React & Node.js',
        instructor: 'Sarah Johnson',
        rating: 4.9,
        totalRatings: 8900,
        price: 149,
        originalPrice: 299,
        duration: '35 hours',
        students: 28000,
        level: 'Advanced',
        language: 'English',
        lastUpdated: '2024-02-01',
        features: ['Certificates', 'Lifetime Access', 'Mobile Access', 'Live Sessions'],
        curriculum: ['Advanced React Patterns', 'Node.js Best Practices', 'GraphQL', 'Testing', 'Deployment'],
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop'
      }
    ]);
  };

  const addToComparison = (course: typeof searchResults[0]) => {
    if (comparisonCourses.length < 3 && !comparisonCourses.find(c => c.id === course.id)) {
      setComparisonCourses(prev => [...prev, course]);
    }
  };

  const removeFromComparison = (courseId: string) => {
    setComparisonCourses(prev => prev.filter(c => c.id !== courseId));
  };

  const handleEnrollCourse = (courseId: string) => {
    console.log('Enrolling in course:', courseId);
    // In a real app, you would navigate to the payment page
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Search Filters */}
          <div className="lg:col-span-1">
            <AdvancedSearch onSearch={handleSearch} onReset={handleReset} />
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">
                Search Results ({searchResults.length} courses)
              </h1>
              <div className="flex items-center gap-2">
                {comparisonCourses.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setShowComparison(!showComparison)}
                  >
                    {showComparison ? 'Hide' : 'Show'} Comparison ({comparisonCourses.length})
                  </Button>
                )}
              </div>
            </div>

            {/* Comparison View */}
            {showComparison && comparisonCourses.length > 0 && (
              <CourseComparison
                courses={comparisonCourses}
                onRemoveCourse={removeFromComparison}
                onEnrollCourse={handleEnrollCourse}
              />
            )}

            {/* Course Results */}
            <div className="space-y-4">
              {searchResults.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-48 h-32 object-cover rounded-lg flex-shrink-0"
                      />
                      
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-xl font-semibold">{course.title}</h3>
                          <p className="text-muted-foreground">by {course.instructor}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{course.rating}</span>
                            <span className="text-sm text-muted-foreground">
                              ({course.totalRatings.toLocaleString()})
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{course.students.toLocaleString()}</span>
                          </div>
                          <Badge variant="secondary">{course.level}</Badge>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {course.features.slice(0, 3).map(feature => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <div className="text-right">
                          <div className="text-2xl font-bold">${course.price}</div>
                          {course.originalPrice && (
                            <div className="text-sm text-muted-foreground line-through">
                              ${course.originalPrice}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => handleEnrollCourse(course.id)}
                            className="w-full"
                          >
                            Enroll Now
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToComparison(course)}
                            disabled={comparisonCourses.length >= 3 || comparisonCourses.some(c => c.id === course.id)}
                          >
                            {comparisonCourses.some(c => c.id === course.id) ? (
                              <>
                                <Minus className="h-3 w-3 mr-1" />
                                Remove
                              </>
                            ) : (
                              <>
                                <Plus className="h-3 w-3 mr-1" />
                                Compare
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
