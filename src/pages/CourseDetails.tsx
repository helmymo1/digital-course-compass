
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Clock, Users, PlayCircle, CheckCircle, Download } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock course data
  const course = {
    id: id || '1',
    title: 'Complete Web Development Bootcamp',
    instructor: 'John Smith',
    price: 99,
    originalPrice: 199,
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop',
    rating: 4.8,
    totalStudents: 15420,
    duration: '40 hours',
    category: 'Web Development',
    level: 'Beginner',
    description: 'Master web development from scratch with this comprehensive bootcamp. Learn HTML, CSS, JavaScript, React, Node.js, and more.',
    whatYouWillLearn: [
      'Build responsive websites with HTML5 and CSS3',
      'Master JavaScript fundamentals and ES6+ features',
      'Create dynamic web applications with React',
      'Develop backend APIs with Node.js and Express',
      'Work with databases using MongoDB',
      'Deploy applications to production'
    ],
    curriculum: [
      {
        title: 'Getting Started',
        lessons: [
          { title: 'Introduction to Web Development', duration: '10 min', type: 'video' },
          { title: 'Setting up Development Environment', duration: '15 min', type: 'video' },
          { title: 'Course Resources', duration: '5 min', type: 'resource' }
        ]
      },
      {
        title: 'HTML & CSS Fundamentals',
        lessons: [
          { title: 'HTML Basics', duration: '25 min', type: 'video' },
          { title: 'CSS Styling', duration: '30 min', type: 'video' },
          { title: 'Responsive Design', duration: '20 min', type: 'video' }
        ]
      },
      {
        title: 'JavaScript Mastery',
        lessons: [
          { title: 'JavaScript Fundamentals', duration: '45 min', type: 'video' },
          { title: 'DOM Manipulation', duration: '30 min', type: 'video' },
          { title: 'Practice Project', duration: '60 min', type: 'project' }
        ]
      }
    ]
  };

  const handleEnroll = () => {
    navigate(`/payment/${course.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <img 
                src={course.image} 
                alt={course.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{course.category}</Badge>
                <Badge variant="outline">{course.level}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">{course.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{course.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.totalStudents.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
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
              </TabsContent>
              
              <TabsContent value="curriculum" className="mt-6">
                <div className="space-y-4">
                  {course.curriculum.map((section, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {section.lessons.map((lesson, lessonIndex) => (
                            <div key={lessonIndex} className="flex items-center justify-between py-2 border-b last:border-b-0">
                              <div className="flex items-center gap-3">
                                {lesson.type === 'video' && <PlayCircle className="h-4 w-4 text-blue-500" />}
                                {lesson.type === 'resource' && <Download className="h-4 w-4 text-green-500" />}
                                {lesson.type === 'project' && <CheckCircle className="h-4 w-4 text-purple-500" />}
                                <span className="text-sm">{lesson.title}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="instructor" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Meet your instructor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                        alt={course.instructor}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{course.instructor}</h3>
                        <p className="text-muted-foreground mb-2">Senior Full Stack Developer</p>
                        <p className="text-sm">
                          With over 10 years of experience in web development, John has worked with 
                          companies ranging from startups to Fortune 500. He's passionate about 
                          teaching and has helped thousands of students launch their careers in tech.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-primary">${course.price}</span>
                    {course.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        ${course.originalPrice}
                      </span>
                    )}
                  </div>
                  {course.originalPrice && (
                    <p className="text-sm text-green-600 font-medium">
                      Save ${course.originalPrice - course.price} today!
                    </p>
                  )}
                </div>

                <Button onClick={handleEnroll} className="w-full mb-4" size="lg">
                  Enroll Now
                </Button>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Total duration:</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Skill level:</span>
                    <span>{course.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Students enrolled:</span>
                    <span>{course.totalStudents.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Certificate:</span>
                    <span>Yes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
