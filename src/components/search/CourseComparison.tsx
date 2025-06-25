
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, X, Star, Clock, Users, Award, PlayCircle } from 'lucide-react';

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
  language: string;
  lastUpdated: string;
  features: string[];
  curriculum: string[];
  image: string;
}

interface CourseComparisonProps {
  courses: Course[];
  onRemoveCourse: (courseId: string) => void;
  onEnrollCourse: (courseId: string) => void;
}

const CourseComparison: React.FC<CourseComparisonProps> = ({
  courses,
  onRemoveCourse,
  onEnrollCourse
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const allFeatures = Array.from(
    new Set(courses.flatMap(course => course.features))
  );

  const getFeatureIcon = (feature: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Certificates': <Award className="h-4 w-4" />,
      'Lifetime Access': <Clock className="h-4 w-4" />,
      'Mobile Access': <PlayCircle className="h-4 w-4" />,
      'Downloadable Resources': <Check className="h-4 w-4" />,
    };
    return icons[feature] || <Check className="h-4 w-4" />;
  };

  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No courses selected for comparison</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Course Comparison</h2>
        <p className="text-muted-foreground">
          Comparing {courses.length} course{courses.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-fit">
          {courses.map((course) => (
            <Card
              key={course.id}
              className={`relative ${
                selectedCourse === course.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <CardHeader className="pb-4">
                <div className="relative">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveCourse(course.id)}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                <p className="text-sm text-muted-foreground">by {course.instructor}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 font-medium">{course.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({course.totalRatings.toLocaleString()} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">${course.price}</span>
                  {course.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${course.originalPrice}
                    </span>
                  )}
                </div>

                {/* Basic Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Students:</span>
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Level:</span>
                    <Badge variant="secondary">{course.level}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Language:</span>
                    <span>{course.language}</span>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-medium mb-2">Features</h4>
                  <div className="space-y-1">
                    {allFeatures.map(feature => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        {course.features.includes(feature) ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-gray-300" />
                        )}
                        <span className={course.features.includes(feature) ? '' : 'text-muted-foreground'}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Curriculum Preview */}
                <div>
                  <h4 className="font-medium mb-2">Curriculum Highlights</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {course.curriculum.slice(0, 3).map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                    {course.curriculum.length > 3 && (
                      <li className="text-xs">
                        +{course.curriculum.length - 3} more topics
                      </li>
                    )}
                  </ul>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => onEnrollCourse(course.id)}
                  className="w-full"
                  variant={selectedCourse === course.id ? 'default' : 'outline'}
                  onMouseEnter={() => setSelectedCourse(course.id)}
                  onMouseLeave={() => setSelectedCourse(null)}
                >
                  Enroll Now - ${course.price}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Comparison Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">Price Range</h4>
              <p className="text-sm text-muted-foreground">
                ${Math.min(...courses.map(c => c.price))} - ${Math.max(...courses.map(c => c.price))}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Average Rating</h4>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">
                  {(courses.reduce((acc, c) => acc + c.rating, 0) / courses.length).toFixed(1)}
                </span>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Total Students</h4>
              <p className="text-sm text-muted-foreground">
                {courses.reduce((acc, c) => acc + c.students, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseComparison;
