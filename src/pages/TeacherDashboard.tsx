
import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, DollarSign, Plus, Eye, Edit, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const myCourses = [
    {
      id: '1',
      title: 'Complete Web Development Bootcamp',
      students: 15420,
      revenue: '$154,200',
      rating: 4.8,
      status: 'published',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop'
    },
    {
      id: '2',
      title: 'Advanced React & Node.js',
      students: 8930,
      revenue: '$115,090',
      rating: 4.9,
      status: 'published',
      image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=200&fit=crop'
    },
    {
      id: '3',
      title: 'JavaScript Fundamentals',
      students: 0,
      revenue: '$0',
      rating: 0,
      status: 'draft',
      image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=300&h=200&fit=crop'
    }
  ];

  const recentActivity = [
    { action: 'New student enrolled', course: 'Web Development Bootcamp', time: '2 hours ago' },
    { action: 'Course review received', course: 'React & Node.js', time: '5 hours ago' },
    { action: 'Payment received', course: 'Web Development Bootcamp', time: '1 day ago' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="teacher" userName="John Smith" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Instructor!</h1>
          <p className="text-purple-100">Manage your courses and track your teaching success</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                      <p className="text-2xl font-bold">3</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                      <p className="text-2xl font-bold">24,350</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">$269,290</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* My Courses */}
            <Card className="mb-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Courses</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myCourses.map(course => (
                    <div key={course.id} className="flex gap-4 p-4 border rounded-lg">
                      <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-24 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{course.title}</h3>
                          <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                            {course.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                          <div>Students: {course.students.toLocaleString()}</div>
                          <div>Revenue: {course.revenue}</div>
                          <div>Rating: {course.rating > 0 ? `${course.rating}/5` : 'No ratings'}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Analytics
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.course}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Course
                </Button>
                <Link to="/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips for Success</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900">Create engaging content</p>
                    <p className="text-blue-700">Use videos, quizzes, and practical exercises</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900">Interact with students</p>
                    <p className="text-green-700">Respond to questions and provide feedback</p>
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

export default TeacherDashboard;
