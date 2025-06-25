
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Users, BarChart as BarChartIcon, User, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AnalyticsDashboard = () => {
  const { t } = useLanguage();
  // Mock analytics data
  const userGrowthData = [
    { month: t('Jan'), students: 400, teachers: 24 },
    { month: t('Feb'), students: 500, teachers: 28 },
    { month: t('Mar'), students: 650, teachers: 32 },
    { month: t('Apr'), students: 800, teachers: 38 },
    { month: t('May'), students: 950, teachers: 42 },
    { month: t('Jun'), students: 1100, teachers: 48 },
  ];

  const revenueData = [
    { month: t('Jan'), revenue: 12000 },
    { month: t('Feb'), revenue: 15000 },
    { month: t('Mar'), revenue: 18000 },
    { month: t('Apr'), revenue: 22000 },
    { month: t('May'), revenue: 25000 },
    { month: t('Jun'), revenue: 28000 },
  ];

  const courseCompletionData = [
    { name: t('Completed'), value: 65, color: '#10B981' },
    { name: t('In Progress'), value: 25, color: '#F59E0B' },
    { name: t('Not Started'), value: 10, color: '#EF4444' },
  ];

  const topCoursesData = [
    { course: t('Web Development'), enrollments: 850 },
    { course: t('Data Science'), enrollments: 720 },
    { course: t('React Mastery'), enrollments: 650 },
    { course: t('Python Basics'), enrollments: 580 },
    { course: t('UI/UX Design'), enrollments: 420 },
  ];

  const chartConfig = {
    students: { label: t('students'), color: '#3B82F6' },
    teachers: { label: t('teachers'), color: '#10B981' },
    revenue: { label: t('revenue'), color: '#8B5CF6' },
    enrollments: { label: t('enrollments'), color: '#F59E0B' },
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('total_users_stats')}</p>
                <p className="text-2xl font-bold">3,247</p>
                <p className="text-xs text-green-600">{t('plus_15_percent_from_last_month')}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('course_completions_stats')}</p>
                <p className="text-2xl font-bold">1,842</p>
                <p className="text-xs text-green-600">{t('plus_8_percent_from_last_month')}</p>
              </div>
              <BarChartIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('avg_session_time_stats')}</p>
                <p className="text-2xl font-bold">42m</p>
                <p className="text-xs text-green-600">{t('plus_5_percent_from_last_month')}</p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('platform_rating_stats')}</p>
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-xs text-green-600">{t('plus_0_2_from_last_month')}</p>
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
            <CardTitle>{t('user_growth_chart_title')}</CardTitle>
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
            <CardTitle>{t('revenue_trend_chart_title')}</CardTitle>
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
            <CardTitle>{t('course_completion_status_chart_title')}</CardTitle>
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
            <CardTitle>{t('top_performing_courses_chart_title')}</CardTitle>
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
          <CardTitle>{t('platform_performance_summary_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">{t('student_engagement_section_title')}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{t('daily_active_users_label')}</span>
                  <span className="font-medium">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('weekly_active_users_label')}</span>
                  <span className="font-medium">2,893</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('monthly_active_users_label')}</span>
                  <span className="font-medium">3,247</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">{t('teacher_performance_section_title')}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{t('avg_course_rating_label')}</span>
                  <span className="font-medium">4.6/5</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('course_completion_rate_label')}</span>
                  <span className="font-medium">78%</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('student_satisfaction_label')}</span>
                  <span className="font-medium">92%</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">{t('revenue_metrics_section_title')}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{t('monthly_revenue_label')}</span>
                  <span className="font-medium">$28,000</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('avg_course_price_label')}</span>
                  <span className="font-medium">$149</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('revenue_growth_label')}</span>
                  <span className="font-medium text-green-600">{t('plus_23_percent')}</span>
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
