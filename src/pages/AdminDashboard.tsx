
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BarChart, Settings, User } from 'lucide-react';
import Header from '@/components/Header';
import UserManagement from '@/components/admin/UserManagement';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import RevenueControl from '@/components/admin/RevenueControl';
import PlatformSettings from '@/components/admin/PlatformSettings';
import ContentManagementPage from '@/components/admin/ContentManagementPage'; // Import ContentManagementPage
import { FileText } from 'lucide-react'; // Icon for Content Management
import { useLanguage } from '@/contexts/LanguageContext';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { t } = useLanguage();

  // Mock admin stats
  const stats = [
    {
      title: t('total_students'),
      value: '2,847',
      change: '+12%',
      icon: <Users className="h-5 w-5" />
    },
    {
      title: t('total_teachers'),
      value: '156',
      change: '+8%',
      icon: <User className="h-5 w-5" />
    },
    {
      title: t('total_revenue'),
      value: '$87,420',
      change: '+23%',
      icon: <BarChart className="h-5 w-5" />
    },
    {
      title: t('active_courses'),
      value: '342',
      change: '+15%',
      icon: <Settings className="h-5 w-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="admin" userName="Admin" onRoleSwitch={() => {}} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('admin_dashboard')}</h1>
          <p className="text-muted-foreground">{t('manage_platform')}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
            <TabsTrigger value="users">{t('user_management')}</TabsTrigger>
            <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
            <TabsTrigger value="revenue">{t('revenue_control')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-green-600">{stat.change} {t('from_last_month')}</p>
                      </div>
                      <div className="text-muted-foreground">{stat.icon}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('quick_actions')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <button 
                    className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setActiveTab('users')}
                  >
                    <div className="font-medium">{t('manage_users')}</div>
                    <div className="text-sm text-muted-foreground">{t('manage_users_desc')}</div>
                  </button>
                  <button 
                    className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setActiveTab('analytics')}
                  >
                    <div className="font-medium">{t('view_analytics')}</div>
                    <div className="text-sm text-muted-foreground">{t('view_analytics_desc')}</div>
                  </button>
                  <button 
                    className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setActiveTab('revenue')}
                  >
                    <div className="font-medium">{t('revenue_settings')}</div>
                    <div className="text-sm text-muted-foreground">{t('revenue_settings_desc')}</div>
                  </button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('recent_activity')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium">{t('new_teacher_registered')}</p>
                        <p className="text-sm text-muted-foreground">{t('sarah_johnson_joined')}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">2{t('hours_ago')}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium">{t('course_published')}</p>
                        <p className="text-sm text-muted-foreground">{t('advanced_react_dev')}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">4{t('hours_ago')}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium">{t('payment_processed')}</p>
                        <p className="text-sm text-muted-foreground">{t('course_enrollment')}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">6{t('hours_ago')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="revenue">
            <RevenueControl />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
