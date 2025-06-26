
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import AdvancedSearch, { SearchFilters as AdvancedSearchFilters } from '@/components/search/AdvancedSearch';
import CourseComparison from '@/components/search/CourseComparison';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [activeSort, setActiveSort] = useState<string>('relevance');

  // Use the imported SearchFilters type from AdvancedSearch.tsx
  // We might extend it here if SearchResults page adds more params like sorting
  interface CurrentSearchParameters extends AdvancedSearchFilters {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }

const initialSearchResultsConst = [
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
  ];

  // Initialize searchResults with the constant data
  // Note: The searchResults state itself is already initialized with mock data in its useState definition.
  // This useEffect is redundant if initialSearchResultsConst is the same as the useState initial data.
  // For clarity, let's ensure searchResults are initialized once with initialSearchResultsConst.
  // We'll actually set the initial state for searchResults directly in its useState.
  // const [searchResults, setSearchResults] = useState(initialSearchResultsConst); // This is better

  // Let's adjust the existing useState for searchResults
  // The original useState for searchResults already contains this mock data.
  // So, we just need to ensure handleReset uses initialSearchResultsConst.

  const handleSearch = (filters: AdvancedSearchFilters) => {
    const currentParams: CurrentSearchParameters = { ...filters, sortBy: activeSort };
    console.log('Search parameters:', currentParams);
    // TODO: In a real app, make an API call here with currentParams
    // For now, we'll just filter the existing results (client-side placeholder)

    // Simple client-side filtering (replace with API call)
    // This is a placeholder and will be replaced by an API call.
    // It only implements a few filters for demonstration.
    const filtered = initialSearchResultsConst.filter(course => {
      if (filters.query && !course.title.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }
      if (filters.level && course.level !== filters.level) {
        return false;
      }
      if (filters.rating && course.rating < filters.rating) {
        return false;
      }
      // Placeholder: filters.category, filters.duration, filters.price,
      // filters.language, filters.instructor, filters.features are not implemented in this client-side filter.
      return true;
    });
    setSearchResults(filtered);
  };

  const handleSortChange = (sortValue: string) => {
    setActiveSort(sortValue);
    // TODO: Re-trigger search by calling handleSearch with current filters + new sort.
    // This requires AdvancedSearch to expose its current filters or SearchResults to store them.
    // For now, this will trigger a search with the current filters from AdvancedSearch if it's re-rendered,
    // or we need a state to hold the last filters.
    // The ideal solution is to lift filter state or use a state management library.
    // For now, we'll just log and the user would need to click "Search" again in AdvancedSearch
    // or we call handleSearch with some stored/default filters.
    console.log(`Sort changed to: ${sortValue}. User should ideally re-apply filters or we store them.`);
    // Example: if we had access to current filters from AdvancedSearch, we'd call:
    // handleSearch(currentAdvancedSearchFilters);
    // For this iteration, the filtering will only re-apply if handleSearch is called again via AdvancedSearch.
  };

  const handleReset = () => {
    setSearchResults(initialSearchResultsConst); // Use the const for resetting
    setActiveSort('relevance');
    // TODO: Call reset on AdvancedSearch component if it has its own state that needs clearing.
    // The onReset prop passed to AdvancedSearch should handle this.
    // AdvancedSearch's own handleReset function already clears its internal state.
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
              <div className="flex items-center gap-4"> {/* Increased gap for Sort by */}
                {/* Sorting Dropdown */}
                <Select value={activeSort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Sort by: Relevance</SelectItem>
                    <SelectItem value="price_asc">Sort by: Price (Low to High)</SelectItem>
                    <SelectItem value="price_desc">Sort by: Price (High to Low)</SelectItem>
                    <SelectItem value="rating">Sort by: Rating</SelectItem>
                    <SelectItem value="newest">Sort by: Newest</SelectItem>
                  </SelectContent>
                </Select>

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
