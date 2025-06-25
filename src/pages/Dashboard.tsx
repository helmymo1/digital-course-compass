import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Trophy, User, Settings, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Dashboard = () => {
  const { t } = useLanguage();
  const [userRole, setUserRole] = useState<'student' | 'teacher'>('student');
  const [userName, setUserName] = useState(t('student'));

  useEffect(() => {
    const role = localStorage.getItem('userRole') as 'student' | 'teacher' || 'student';
    const name = localStorage.getItem('userName') || 'Student';
    setUserRole(role);
    setUserName(name);
  }, []);

  const handleRoleSwitch = (newRole: 'student' | 'teacher') => {
    setUserRole(newRole);
    // Redirect to appropriate dashboard
    if (newRole === 'teacher') {
      window.location.href = '/teacher-dashboard';
    }
  };

  const enrolledCourses = [
    {
      id: '1',
      title: 'Complete Web Development Bootcamp',
      instructor: 'John Smith',
      progress: 65,
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop',
      nextLesson: 'JavaScript Functions',
      totalLessons: 150,
      completedLessons: 98
    },
    {
      id: '2',
      title: 'Advanced React & Node.js',
      instructor: 'Sarah Johnson',
      progress: 30,
      image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=200&fit=crop',
      nextLesson: 'State Management with Redux',
      totalLessons: 120,
      completedLessons: 36
    },
    {
      id: '3',
      title: 'Data Science with Python',
      instructor: 'Michael Chen',
      progress: 80,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
      nextLesson: 'Machine Learning Algorithms',
      totalLessons: 200,
      completedLessons: 160
    }
  ];

  const recentActivity = [
    { course: 'Web Development Bootcamp', lesson: 'CSS Grid Layout', completedAt: '2 hours ago' },
    { course: 'React & Node.js', lesson: 'Component Lifecycle', completedAt: '1 day ago' },
    { course: 'Data Science', lesson: 'Data Visualization', completedAt: '2 days ago' }
  ];

  const achievements = [
    { title: 'First Course Completed', icon: <Trophy className="h-5 w-5" />, earned: true },
    { title: 'Week Streak', icon: <Clock className="h-5 w-5" />, earned: true },
    { title: 'Fast Learner', icon: <BookOpen className="h-5 w-5" />, earned: false }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header userRole={userRole} userName={userName} onRoleSwitch={handleRoleSwitch} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}!</h1>
          <p className="text-blue-100">Ready to continue your learning journey?</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Progress Overview */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">3</div>
                    <p className="text-sm text-muted-foreground">Courses Enrolled</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">58%</div>
                    <p className="text-sm text-muted-foreground">Average Progress</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">45h</div>
                    <p className="text-sm text-muted-foreground">Total Learning Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* My Courses */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {enrolledCourses.map(course => (
                    <div key={course.id} className="flex gap-4 p-4 border rounded-lg">
                      <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-24 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">by {course.instructor}</p>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {course.completedLessons}/{course.totalLessons} lessons
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm">Next: {course.nextLesson}</p>
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-1" />
                            Continue
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
                        <p className="font-medium">{activity.lesson}</p>
                        <p className="text-sm text-muted-foreground">{activity.course}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.completedAt}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Actions */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/courses">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Courses
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                <Link to="/account">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div key={index} className={`flex items-center gap-3 p-2 rounded ${achievement.earned ? 'bg-yellow-50 border border-yellow-200' : 'opacity-50'}`}>
                      <div className={`p-2 rounded-full ${achievement.earned ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
                        {achievement.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{achievement.title}</p>
                        {achievement.earned && (
                          <Badge variant="secondary" className="text-xs">Earned</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
