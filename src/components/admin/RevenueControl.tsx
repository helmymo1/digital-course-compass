
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Settings, Edit } from 'lucide-react';

const RevenueControl = () => {
  const [platformFee, setPlatformFee] = useState(20);
  const [teacherShare, setTeacherShare] = useState(80);
  const [autoApproval, setAutoApproval] = useState(true);

  // Mock course pricing data
  const courses = [
    { id: 1, title: 'Complete Web Development Bootcamp', price: 199, teacherShare: 80, platformFee: 20, status: 'active', revenue: 15840 },
    { id: 2, title: 'Advanced React & Node.js', price: 149, teacherShare: 75, platformFee: 25, status: 'active', revenue: 11175 },
    { id: 3, title: 'Data Science with Python', price: 249, teacherShare: 85, platformFee: 15, status: 'active', revenue: 19920 },
    { id: 4, title: 'UI/UX Design Masterclass', price: 129, teacherShare: 80, platformFee: 20, status: 'pending', revenue: 0 },
  ];

  const totalRevenue = courses.reduce((sum, course) => sum + course.revenue, 0);
  const platformRevenue = courses.reduce((sum, course) => sum + (course.revenue * course.platformFee / 100), 0);
  const teacherRevenue = totalRevenue - platformRevenue;

  const handleUpdateGlobalSettings = () => {
    console.log('Updating global revenue settings:', { platformFee, teacherShare, autoApproval });
  };

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600">+23% from last month</p>
              </div>
              <BarChart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Platform Revenue</p>
                <p className="text-2xl font-bold">${platformRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{((platformRevenue / totalRevenue) * 100).toFixed(1)}% of total</p>
              </div>
              <Settings className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Teacher Revenue</p>
                <p className="text-2xl font-bold">${teacherRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{((teacherRevenue / totalRevenue) * 100).toFixed(1)}% of total</p>
              </div>
              <BarChart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Revenue Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Global Revenue Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="platformFee">Platform Fee (%)</Label>
                <Input
                  id="platformFee"
                  type="number"
                  value={platformFee}
                  onChange={(e) => {
                    const fee = Number(e.target.value);
                    setPlatformFee(fee);
                    setTeacherShare(100 - fee);
                  }}
                  min="0"
                  max="100"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Percentage of course revenue that goes to the platform
                </p>
              </div>
              <div>
                <Label htmlFor="teacherShare">Teacher Share (%)</Label>
                <Input
                  id="teacherShare"
                  type="number"
                  value={teacherShare}
                  onChange={(e) => {
                    const share = Number(e.target.value);
                    setTeacherShare(share);
                    setPlatformFee(100 - share);
                  }}
                  min="0"
                  max="100"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Percentage of course revenue that goes to teachers
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoApproval">Auto-approve Course Pricing</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve teacher course pricing changes
                  </p>
                </div>
                <Switch
                  id="autoApproval"
                  checked={autoApproval}
                  onCheckedChange={setAutoApproval}
                />
              </div>
              <div className="pt-4">
                <Button onClick={handleUpdateGlobalSettings} className="w-full">
                  Update Global Settings
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Revenue Management */}
      <Card>
        <CardHeader>
          <CardTitle>Course Revenue Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Teacher Share</TableHead>
                <TableHead>Platform Fee</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>${course.price}</TableCell>
                  <TableCell>{course.teacherShare}%</TableCell>
                  <TableCell>{course.platformFee}%</TableCell>
                  <TableCell>${course.revenue.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pricing Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pricing Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Course Price:</span>
                <span className="font-bold">${(courses.reduce((sum, c) => sum + c.price, 0) / courses.length).toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Highest Priced Course:</span>
                <span className="font-bold">${Math.max(...courses.map(c => c.price))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Lowest Priced Course:</span>
                <span className="font-bold">${Math.min(...courses.map(c => c.price))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Courses Pending Approval:</span>
                <span className="font-bold">{courses.filter(c => c.status === 'pending').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Platform Revenue</span>
                  <span>{((platformRevenue / totalRevenue) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(platformRevenue / totalRevenue) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Teacher Revenue</span>
                  <span>{((teacherRevenue / totalRevenue) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(teacherRevenue / totalRevenue) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RevenueControl;
