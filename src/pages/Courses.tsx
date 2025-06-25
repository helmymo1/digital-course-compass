
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import CourseCard from '@/components/CourseCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Courses = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<string[]>([]);

  // Sample course data
  const courses = [
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
    },
    {
      id: '4',
      title: 'UI/UX Design Masterclass',
      instructor: 'Emily Rodriguez',
      price: 89,
      originalPrice: 149,
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
      rating: 4.8,
      totalStudents: 9870,
      duration: '30 hours',
      category: 'Design',
      level: 'Beginner' as const
    },
    {
      id: '5',
      title: 'Machine Learning A-Z',
      instructor: 'David Thompson',
      price: 149,
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop',
      rating: 4.9,
      totalStudents: 7230,
      duration: '60 hours',
      category: 'Data Science',
      level: 'Advanced' as const
    },
    {
      id: '6',
      title: 'Digital Marketing Strategy',
      instructor: 'Lisa Park',
      price: 79,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      rating: 4.6,
      totalStudents: 11400,
      duration: '25 hours',
      category: 'Marketing',
      level: 'Intermediate' as const
    }
  ];

  const categories = ['Web Development', 'Data Science', 'Design', 'Marketing', 'Business'];
  const priceFilters = ['Free', 'Paid'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategories.length === 0 || 
                           selectedCategories.includes(course.category);
    
    const matchesPrice = selectedPriceFilter.length === 0 ||
                        (selectedPriceFilter.includes('Free') && course.price === 0) ||
                        (selectedPriceFilter.includes('Paid') && course.price > 0);

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  const handlePriceFilterChange = (filter: string, checked: boolean) => {
    if (checked) {
      setSelectedPriceFilter([...selectedPriceFilter, filter]);
    } else {
      setSelectedPriceFilter(selectedPriceFilter.filter(f => f !== filter));
    }
  };

  const handleViewDetails = (courseId: string) => {
    console.log('View course details:', courseId);
    // Navigate to course details page
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Explore Courses</h1>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search courses or instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => 
                            handleCategoryChange(category, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={category}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h3 className="font-semibold mb-3">Price</h3>
                  <div className="space-y-2">
                    {priceFilters.map(filter => (
                      <div key={filter} className="flex items-center space-x-2">
                        <Checkbox
                          id={filter}
                          checked={selectedPriceFilter.includes(filter)}
                          onCheckedChange={(checked) => 
                            handlePriceFilterChange(filter, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={filter}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {filter}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedPriceFilter([]);
                    setSearchTerm('');
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Course Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-muted-foreground">
                {filteredCourses.length} courses found
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <CourseCard
                  key={course.id}
                  {...course}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
