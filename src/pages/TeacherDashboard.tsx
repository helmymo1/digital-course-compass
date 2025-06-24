
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Users, DollarSign, Plus, Eye, Edit, BarChart3, Trash2, Gift, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<'student' | 'teacher'>('teacher');
  const [userName] = useState('John Smith');
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false);
  const [showPromoDialog, setShowPromoDialog] = useState(false);

  const handleRoleSwitch = (newRole: 'student' | 'teacher') => {
    setUserRole(newRole);
    localStorage.setItem('userRole', newRole);
    if (newRole === 'student') {
      navigate('/dashboard');
    }
  };

  const [myCourses, setMyCourses] = useState([
    {
      id: '1',
      title: 'Complete Web Development Bootcamp',
      students: 15420,
      revenue: 154200,
      rating: 4.8,
      status: 'published',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop'
    },
    {
      id: '2',
      title: 'Advanced React & Node.js',
      students: 8930,
      revenue: 115090,
      rating: 4.9,
      status: 'published',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=200&fit=crop'
    },
    {
      id: '3',
      title: 'JavaScript Fundamentals',
      students: 0,
      revenue: 0,
      rating: 0,
      status: 'draft',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=300&h=200&fit=crop'
    }
  ]);

  const [payments] = useState([
    { id: '1', student: 'Alice Johnson', course: 'Web Development Bootcamp', amount: 89.99, date: '2024-01-15', status: 'completed' },
    { id: '2', student: 'Bob Smith', course: 'React & Node.js', amount: 129.99, date: '2024-01-14', status: 'completed' },
    { id: '3', student: 'Carol Davis', course: 'Web Development Bootcamp', amount: 89.99, date: '2024-01-13', status: 'pending' },
    { id: '4', student: 'David Wilson', course: 'React & Node.js', amount: 129.99, date: '2024-01-12', status: 'completed' },
  ]);

  const [promoCodes, setPromoCodes] = useState([
    { id: '1', code: 'WELCOME20', discount: 20, type: 'percentage', uses: 150, maxUses: 200, expires: '2024-12-31', status: 'active' },
    { id: '2', code: 'STUDENT50', discount: 50, type: 'fixed', uses: 75, maxUses: 100, expires: '2024-06-30', status: 'active' },
    { id: '3', code: 'BLACKFRIDAY', discount: 30, type: 'percentage', uses: 300, maxUses: 300, expires: '2024-11-30', status: 'expired' },
  ]);

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    level: ''
  });

  const [newPromo, setNewPromo] = useState({
    code: '',
    discount: '',
    type: 'percentage',
    maxUses: '',
    expires: ''
  });

  const handleAddCourse = () => {
    if (!newCourse.title || !newCourse.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const course = {
      id: (myCourses.length + 1).toString(),
      title: newCourse.title,
      students: 0,
      revenue: 0,
      rating: 0,
      status: 'draft' as const,
      price: parseFloat(newCourse.price),
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop'
    };

    setMyCourses([...myCourses, course]);
    setNewCourse({ title: '', description: '', price: '', category: '', level: '' });
    setShowAddCourseDialog(false);
    
    toast({
      title: "Success",
      description: "Course created successfully"
    });
  };

  const handleRemoveCourse = (courseId: string) => {
    setMyCourses(myCourses.filter(course => course.id !== courseId));
    toast({
      title: "Success",
      description: "Course removed successfully"
    });
  };

  const handleAddPromo = () => {
    if (!newPromo.code || !newPromo.discount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const promo = {
      id: (promoCodes.length + 1).toString(),
      code: newPromo.code,
      discount: parseFloat(newPromo.discount),
      type: newPromo.type as 'percentage' | 'fixed',
      uses: 0,
      maxUses: parseInt(newPromo.maxUses) || 100,
      expires: newPromo.expires,
      status: 'active' as const
    };

    setPromoCodes([...promoCodes, promo]);
    setNewPromo({ code: '', discount: '', type: 'percentage', maxUses: '', expires: '' });
    setShowPromoDialog(false);
    
    toast({
      title: "Success",
      description: "Promo code created successfully"
    });
  };

  const totalRevenue = myCourses.reduce((sum, course) => sum + course.revenue, 0);
  const totalStudents = myCourses.reduce((sum, course) => sum + course.students, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header userRole={userRole} userName={userName} onRoleSwitch={handleRoleSwitch} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Instructor!</h1>
          <p className="text-purple-100">Manage your courses and track your teaching success</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                  <p className="text-2xl font-bold">{myCourses.length}</p>
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
                  <p className="text-2xl font-bold">{totalStudents.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Avg. Rating</p>
                  <p className="text-2xl font-bold">4.9</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="promos">Promo Codes</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Course Management</CardTitle>
                <Dialog open={showAddCourseDialog} onOpenChange={setShowAddCourseDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Course</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Course Title *</Label>
                        <Input
                          id="title"
                          value={newCourse.title}
                          onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                          placeholder="Enter course title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newCourse.description}
                          onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                          placeholder="Course description"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Price *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newCourse.price}
                          onChange={(e) => setNewCourse({...newCourse, price: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select onValueChange={(value) => setNewCourse({...newCourse, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="programming">Programming</SelectItem>
                            <SelectItem value="design">Design</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="level">Level</Label>
                        <Select onValueChange={(value) => setNewCourse({...newCourse, level: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddCourse} className="w-full">
                        Create Course
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
                        <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                          <div>Students: {course.students.toLocaleString()}</div>
                          <div>Revenue: ${course.revenue.toLocaleString()}</div>
                          <div>Price: ${course.price}</div>
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
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleRemoveCourse(course.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.student}</TableCell>
                        <TableCell>{payment.course}</TableCell>
                        <TableCell>${payment.amount}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="promos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Promo Codes</CardTitle>
                <Dialog open={showPromoDialog} onOpenChange={setShowPromoDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Gift className="h-4 w-4 mr-2" />
                      Create Promo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Promo Code</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="promo-code">Promo Code *</Label>
                        <Input
                          id="promo-code"
                          value={newPromo.code}
                          onChange={(e) => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})}
                          placeholder="PROMO20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="discount">Discount *</Label>
                        <Input
                          id="discount"
                          type="number"
                          value={newPromo.discount}
                          onChange={(e) => setNewPromo({...newPromo, discount: e.target.value})}
                          placeholder="20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Discount Type</Label>
                        <Select onValueChange={(value) => setNewPromo({...newPromo, type: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="max-uses">Max Uses</Label>
                        <Input
                          id="max-uses"
                          type="number"
                          value={newPromo.maxUses}
                          onChange={(e) => setNewPromo({...newPromo, maxUses: e.target.value})}
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="expires">Expires</Label>
                        <Input
                          id="expires"
                          type="date"
                          value={newPromo.expires}
                          onChange={(e) => setNewPromo({...newPromo, expires: e.target.value})}
                        />
                      </div>
                      <Button onClick={handleAddPromo} className="w-full">
                        Create Promo Code
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Uses</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promoCodes.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell className="font-mono">{promo.code}</TableCell>
                        <TableCell>
                          {promo.discount}{promo.type === 'percentage' ? '%' : '$'} off
                        </TableCell>
                        <TableCell>{promo.uses}/{promo.maxUses}</TableCell>
                        <TableCell>{promo.expires}</TableCell>
                        <TableCell>
                          <Badge variant={promo.status === 'active' ? 'default' : 'secondary'}>
                            {promo.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherDashboard;
