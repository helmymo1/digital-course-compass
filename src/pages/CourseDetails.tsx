
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import VideoPlayer from '@/components/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  Clock, 
  Users, 
  Award, 
  Play, 
  CheckCircle, 
  Lock,
  Download,
  Globe
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const CourseDetails = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const [selectedLesson, setSelectedLesson] = useState(0);

  // Mock courses data with different courses
  const coursesData = {
    '1': {
      id: '1',
      title: 'Complete Web Development Bootcamp',
      instructor: 'John Smith',
      price: 99,
      originalPrice: 199,
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
      rating: 4.8,
      totalStudents: 15420,
      duration: '40 hours',
      level: 'Beginner',
      language: 'English',
      lastUpdated: 'December 2024',
      description: 'Master web development from scratch with this comprehensive bootcamp. Learn HTML, CSS, JavaScript, React, Node.js, and more.',
      whatYouWillLearn: [
        'Build responsive websites using HTML, CSS, and JavaScript',
        'Create modern web applications with React',
        'Develop backend APIs with Node.js and Express',
        'Work with databases like MongoDB',
        'Deploy applications to production',
        'Use version control with Git and GitHub'
      ],
      requirements: [
        'Basic computer skills',
        'No prior programming experience required',
        'A computer with internet connection',
        'Willingness to learn and practice'
      ],
      curriculum: [
        {
          title: 'Introduction to Web Development',
          lessons: [
            { title: 'Course Introduction', duration: '5:24', isPreview: true, completed: false },
            { title: 'Setting Up Your Development Environment', duration: '12:30', isPreview: false, completed: false },
            { title: 'Understanding How the Web Works', duration: '8:45', isPreview: false, completed: false }
          ]
        },
        {
          title: 'HTML Fundamentals',
          lessons: [
            { title: 'HTML Basics and Structure', duration: '15:20', isPreview: true, completed: false },
            { title: 'HTML Elements and Tags', duration: '18:15', isPreview: false, completed: false },
            { title: 'Forms and Input Elements', duration: '22:10', isPreview: false, completed: false }
          ]
        },
        {
          title: 'CSS Styling',
          lessons: [
            { title: 'CSS Fundamentals', duration: '20:30', isPreview: false, completed: false },
            { title: 'CSS Flexbox', duration: '25:45', isPreview: false, completed: false },
            { title: 'CSS Grid Layout', duration: '30:20', isPreview: false, completed: false }
          ]
        }
      ]
    },
    '2': {
      id: '2',
      title: 'Advanced React & Node.js',
      instructor: 'Sarah Johnson',
      price: 129,
      originalPrice: 199,
      image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=400&fit=crop',
      rating: 4.9,
      totalStudents: 8930,
      duration: '35 hours',
      level: 'Advanced',
      language: 'English',
      lastUpdated: 'December 2024',
      description: 'Master advanced React concepts and build scalable full-stack applications with Node.js. Perfect for developers wanting to level up their skills.',
      whatYouWillLearn: [
        'Advanced React patterns and hooks',
        'State management with Redux Toolkit',
        'Building RESTful APIs with Node.js and Express',
        'Authentication and authorization',
        'Testing React applications',
        'Performance optimization techniques'
      ],
      requirements: [
        'Solid understanding of JavaScript',
        'Basic React knowledge required',
        'Familiarity with Node.js basics',
        'Experience with web development'
      ],
      curriculum: [
        {
          title: 'Advanced React Concepts',
          lessons: [
            { title: 'Course Overview', duration: '8:15', isPreview: true, completed: false },
            { title: 'Custom Hooks Deep Dive', duration: '22:30', isPreview: false, completed: false },
            { title: 'Context API and useReducer', duration: '18:45', isPreview: false, completed: false }
          ]
        },
        {
          title: 'State Management',
          lessons: [
            { title: 'Redux Toolkit Setup', duration: '15:20', isPreview: true, completed: false },
            { title: 'RTK Query for API calls', duration: '28:15', isPreview: false, completed: false },
            { title: 'Redux DevTools', duration: '12:10', isPreview: false, completed: false }
          ]
        },
        {
          title: 'Node.js Backend',
          lessons: [
            { title: 'Express.js Advanced Features', duration: '25:30', isPreview: false, completed: false },
            { title: 'Database Integration', duration: '32:45', isPreview: false, completed: false },
            { title: 'API Security Best Practices', duration: '20:20', isPreview: false, completed: false }
          ]
        }
      ]
    }
  };

  // Get the course data based on ID, fallback to course 1 if not found
  const course = coursesData[id as keyof typeof coursesData] || coursesData['1'];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="mb-8">
              <VideoPlayer 
                title={course.curriculum[0].lessons[selectedLesson]?.title || 'Course Introduction'}
                thumbnail={course.image}
              />
            </div>

            {/* Course Info */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating}</span>
                  <span className="text-muted-foreground">({course.totalStudents.toLocaleString()} students)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{course.duration}</span>
                </div>
                <Badge>{course.level}</Badge>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>{course.language}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Created by <span className="font-medium">{course.instructor}</span> • 
                Last updated {course.lastUpdated}
              </p>
            </div>

            {/* Course Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>What you'll learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {course.whatYouWillLearn.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.requirements.map((req, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="curriculum">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Curriculum</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {course.curriculum.length} sections • {course.curriculum.reduce((acc, section) => acc + section.lessons.length, 0)} lectures • {course.duration} total length
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {course.curriculum.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="border rounded-lg">
                          <div className="p-4 bg-muted/50">
                            <h3 className="font-medium">{section.title}</h3>
                          </div>
                          <div className="divide-y">
                            {section.lessons.map((lesson, lessonIndex) => (
                              <div 
                                key={lessonIndex} 
                                className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer"
                                onClick={() => lesson.isPreview && setSelectedLesson(lessonIndex)}
                              >
                                <div className="flex items-center gap-3">
                                  {lesson.isPreview ? (
                                    <Play className="h-4 w-4 text-blue-600" />
                                  ) : (
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className={lesson.isPreview ? 'text-blue-600' : ''}>{lesson.title}</span>
                                  {lesson.isPreview && <Badge variant="outline" className="text-xs">Preview</Badge>}
                                </div>
                                <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="instructor">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                        {course.instructor.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{course.instructor}</h3>
                        <p className="text-muted-foreground mb-4">
                          {course.id === '2' ? 'Senior React Developer & Technical Lead' : 'Senior Full Stack Developer & Instructor'}
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            <span>4.9 Instructor Rating</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            <span>{course.id === '2' ? '28,450' : '45,230'} Students</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            <span>{course.id === '2' ? '8' : '12'} Courses</span>
                          </div>
                        </div>
                        <p className="mt-4 text-sm">
                          {course.id === '2' 
                            ? 'Sarah is a seasoned React developer with over 8 years of experience building scalable web applications. She has worked at several top tech companies and specializes in modern React patterns and Node.js backends.'
                            : 'John is a seasoned developer with over 10 years of experience in web development. He has worked with major tech companies and has taught thousands of students worldwide.'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Reviews will be displayed here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardContent className="p-6">
                  <div className="aspect-video mb-4 bg-muted rounded-lg overflow-hidden">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-3xl font-bold">${course.price}</span>
                        {course.originalPrice && (
                          <>
                            <span className="text-lg text-muted-foreground line-through">${course.originalPrice}</span>
                            <Badge variant="secondary">{Math.round((1 - course.price / course.originalPrice) * 100)}% OFF</Badge>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-red-600 font-medium">2 days left at this price!</p>
                    </div>

                    <Link to={`/payment/${course.id}`}>
                      <Button className="w-full" size="lg">
                        Enroll Now
                      </Button>
                    </Link>
                    
                    <Button variant="outline" className="w-full">
                      Add to Wishlist
                    </Button>

                    <div className="pt-4 border-t space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>30-Day Money-Back Guarantee</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Full Lifetime Access</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Access on Mobile and TV</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Certificate of Completion</span>
                        <Award className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
