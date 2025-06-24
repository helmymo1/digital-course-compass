
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Users, BarChart as BarChartIcon, User, Settings } from 'lucide-react';

const AnalyticsDashboard = () => {
  // Mock analytics data
  const userGrowthData = [
    { month: 'Jan', students: 400, teachers: 24 },
    { month: 'Feb', students: 500, teachers: 28 },
    { month: 'Mar', students: 650, teachers: 32 },
    { month: 'Apr', students: 800, teachers: 38 },
    { month: 'May', students: 950, teachers: 42 },
    { month: 'Jun', students: 1100, teachers: 48 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 22000 },
    { month: 'May', revenue: 25000 },
    { month: 'Jun', revenue: 28000 },
  ];

  const courseCompletionData = [
    { name: 'Completed', value: 65, color: '#10B981' },
    { name: 'In Progress', value: 25, color: '#F59E0B' },
    { name: 'Not Started', value: 10, color: '#EF4444' },
  ];

  const topCoursesData = [
    { course: 'Web Development', enrollments: 850 },
    { course: 'Data Science', enrollments: 720 },
    { course: 'React Mastery', enrollments: 650 },
    { course: 'Python Basics', enrollments: 580 },
    { course: 'UI/UX Design', enrollments: 420 },
  ];

  const chartConfig = {
    students: { label: 'Students', color: '#3B82F6' },
    teachers: { label: 'Teachers', color: '#10B981' },
    revenue: { label: 'Revenue', color: '#8B5CF6' },
    enrollments: { label: 'Enrollments', color: '#F59E0B' },
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">3,247</p>
                <p className="text-xs text-green-600">+15% from last month</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Course Completions</p>
                <p className="text-2xl font-bold">1,842</p>
                <p className="text-xs text-green-600">+8% from last month</p>
              </div>
              <BarChartIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Session Time</p>
                <p className="text-2xl font-bold">42m</p>
                <p className="text-xs text-green-600">+5% from last month</p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Platform Rating</p>
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-xs text-green-600">+0.2 from last month</p>
              </div>
              <Settings className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="students" fill="var(--color-students)" />
                <Bar dataKey="teachers" fill="var(--color-teachers)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={3} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Course Completion */}
        <Card>
          <CardHeader>
            <CardTitle>Course Completion Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseCompletionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {courseCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <BarChart data={topCoursesData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="course" type="category" width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="enrollments" fill="var(--color-enrollments)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">Student Engagement</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Daily Active Users:</span>
                  <span className="font-medium">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span>Weekly Active Users:</span>
                  <span className="font-medium">2,893</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Active Users:</span>
                  <span className="font-medium">3,247</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Teacher Performance</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Avg. Course Rating:</span>
                  <span className="font-medium">4.6/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Course Completion Rate:</span>
                  <span className="font-medium">78%</span>
                </div>
                <div className="flex justify-between">
                  <span>Student Satisfaction:</span>
                  <span className="font-medium">92%</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Revenue Metrics</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Monthly Revenue:</span>
                  <span className="font-medium">$28,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg. Course Price:</span>
                  <span className="font-medium">$149</span>
                </div>
                <div className="flex justify-between">
                  <span>Revenue Growth:</span>
                  <span className="font-medium text-green-600">+23%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
